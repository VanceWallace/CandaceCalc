/**
 * Main Calculator Screen
 * Retro 1980s calculator for checkbook balancing
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, StatusBar, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { Display } from '@/components/calculator/Display';
import { ButtonGrid } from '@/components/calculator/ButtonGrid';
import { ReceiptTape } from '@/components/calculator/ReceiptTape';
import { ErrorModal } from '@/components/calculator/ErrorModal';
import { UndoRedoIndicator } from '@/components/calculator/UndoRedoIndicator';

// Hooks
import { useCalculator } from '@/hooks/calculator/useCalculator';
import { useUndoRedo } from '@/hooks/calculator/useUndoRedo';

// Utils and constants
import { CalculatorEngine as CalcEngine } from '@/utils/calculator';
import { RetroColors } from '@/constants/Colors';
import {
  loadSettings,
  getHistory,
  saveCalculationToHistory,
  autoCleanupHistory,
  saveLastBalance,
} from '@/utils/storage';
import { CalculationHistory, AppSettings, CalculatorState } from '@/types/calculator';

export default function CalculatorScreen() {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const [settings, setSettings] = useState<AppSettings>({
    mode: 'checkbook',
    lcdColor: 'amber',
    soundEnabled: true,
    retentionDays: 90,
    currencySymbol: '$',
    showModeWarning: true,
  });

  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Calculator logic
  const calculator = useCalculator(settings.mode);
  const undoRedo = useUndoRedo(calculator.state);

  /**
   * Load settings and history on app start
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);

        // Auto-cleanup old history
        await autoCleanupHistory(loadedSettings.retentionDays);

        // Load history
        const loadedHistory = await getHistory();
        setHistory(loadedHistory);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    initialize();
  }, []);

  /**
   * Destructure functions to avoid entire object as dependency
   */
  const {
    handleNumberPress: calculatorHandleNumberPress,
    handleDecimal: calculatorHandleDecimal,
    handleOperatorPress: calculatorHandleOperatorPress,
    handleEquals: calculatorHandleEquals,
    handleClear: calculatorHandleClear,
    handleAllClear: calculatorHandleAllClear,
    handleBackspace: calculatorHandleBackspace,
    restoreState,
    state: calculatorState,
  } = calculator;

  /**
   * Track calculator state changes for undo/redo
   * Uses ref to avoid infinite loops while still capturing state changes
   */
  const prevStateRef = useRef<CalculatorState | null>(null);
  useEffect(() => {
    // Skip on initial mount
    if (prevStateRef.current === null) {
      prevStateRef.current = calculatorState;
      return;
    }

    // Only push to undo stack if display or operation actually changed
    const stateChanged =
      prevStateRef.current.display !== calculatorState.display ||
      prevStateRef.current.operation !== calculatorState.operation ||
      prevStateRef.current.previousValue !== calculatorState.previousValue;

    if (stateChanged && !calculatorState.error) {
      undoRedo.pushState(calculatorState);
      prevStateRef.current = calculatorState;
    }
  }, [calculatorState.display, calculatorState.operation, calculatorState.previousValue, undoRedo.pushState]);

  /**
   * Handle number button press
   */
  const handleNumberPress = useCallback((digit: string) => {
    calculatorHandleNumberPress(digit);
  }, [calculatorHandleNumberPress]);

  /**
   * Handle decimal press
   */
  const handleDecimal = useCallback(() => {
    calculatorHandleDecimal();
  }, [calculatorHandleDecimal]);

  /**
   * Handle operator press
   */
  const handleOperatorPress = useCallback((op: string) => {
    calculatorHandleOperatorPress(op as any);
  }, [calculatorHandleOperatorPress]);

  /**
   * Handle equals - this should also save to history
   */
  const handleEquals = useCallback(async () => {
    const prevState = calculatorState;

    // Update calculator display first
    calculatorHandleEquals();

    // Save to history if we had a valid calculation to perform
    if (prevState.operation !== null && prevState.previousValue !== null) {
      const currentValue = CalcEngine.getDisplayValue(prevState.display);

      // Calculate result ourselves to avoid race condition with state updates
      const { result, error } = CalcEngine.calculate(
        prevState.previousValue,
        prevState.operation,
        currentValue,
        settings.mode
      );

      if (!error) {
        const expression = CalcEngine.formatExpression(
          prevState.previousValue,
          prevState.operation,
          currentValue,
          settings.currencySymbol
        );

        const displayResult = CalcEngine.formatForDisplay(
          result,
          settings.mode,
          settings.currencySymbol
        );

        // Save to history
        saveCalculationToHistory(expression, result, displayResult)
          .then((newItem) => {
            if (newItem) {
              setHistory((prev) => [newItem, ...prev]);

              // Save last balance for checkbook mode
              if (settings.mode === 'checkbook') {
                saveLastBalance(result);
              }
            }
          })
          .catch((error) => console.error('Error saving to history:', error));
      }
    }
  }, [calculatorHandleEquals, calculatorState, settings]);

  /**
   * Handle undo
   */
  const handleUndo = useCallback(() => {
    if (undoRedo.canUndo()) {
      undoRedo.undo((newState) => {
        restoreState(newState);
      });
    }
  }, [restoreState, undoRedo.canUndo, undoRedo.undo]);

  /**
   * Handle redo
   */
  const handleRedo = useCallback(() => {
    if (undoRedo.canRedo()) {
      undoRedo.redo((newState) => {
        restoreState(newState);
      });
    }
  }, [restoreState, undoRedo.canRedo, undoRedo.redo]);

  /**
   * Handle history item select
   */
  const handleHistoryItemSelect = useCallback((item: CalculationHistory) => {
    // Restore the calculation result to display
    restoreState({
      display: item.displayResult,
      expression: item.expression,
      previousValue: null,
      operation: null,
      waitingForOperand: true,
      error: false,
      errorMessage: '',
    });
  }, [restoreState]);

  /**
   * Handle error modal undo
   */
  const handleErrorUndo = useCallback(() => {
    calculatorHandleAllClear();
    handleUndo();
  }, [calculatorHandleAllClear, handleUndo]);

  // Calculate responsive heights for 3-section layout
  const historyHeight = Math.max(screenHeight * 0.25, 120); // 25% of screen, min 120px
  const displayHeight = Platform.select({ web: 140, default: 120 }); // Fixed display height

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: RetroColors.casingBeige,
    },
    container: {
      flex: 1,
      backgroundColor: RetroColors.casingBeige,
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 8,
    },
    // Section 1: History - Fixed height, scrollable
    receiptSection: {
      height: historyHeight,
      marginBottom: 12,
    },
    // Section 2: Display - Fixed height
    displaySection: {
      height: displayHeight,
      marginBottom: 12,
    },
    // Section 3: Buttons - Takes remaining space
    buttonSection: {
      flex: 1,
      minHeight: 300, // Ensure buttons always have space
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={RetroColors.casingBeige}
      />

      {/* Undo/Redo Indicator - Inside SafeAreaView to push content down */}
      {undoRedo.feedback && (
        <UndoRedoIndicator
          visible={!!undoRedo.feedback}
          message={undoRedo.feedback.message}
          isUndo={undoRedo.feedback.isUndo}
          onDismiss={undoRedo.clearFeedback}
        />
      )}

      <View style={styles.container}>
        {/* Receipt Tape / History - FIRST, at the top */}
        <View style={styles.receiptSection}>
          <ReceiptTape
            history={history}
            onHistoryItemSelect={handleHistoryItemSelect}
            isLoading={historyLoading}
            mode={settings.mode}
          />
        </View>

        {/* Display */}
        <View style={styles.displaySection}>
          <Display
            value={calculatorState.display}
            expression={calculatorState.expression}
            error={calculatorState.error}
            errorMessage={calculatorState.errorMessage}
            lcdColor={settings.lcdColor}
            mode={settings.mode}
            currencySymbol={settings.currencySymbol}
          />
        </View>

        {/* Button Grid */}
        <View style={styles.buttonSection}>
          <ButtonGrid
            mode={settings.mode}
            onNumberPress={handleNumberPress}
            onDecimalPress={handleDecimal}
            onOperatorPress={handleOperatorPress}
            onEqualsPress={handleEquals}
            onClear={calculatorHandleClear}
            onAllClear={calculatorHandleAllClear}
            onBackspace={calculatorHandleBackspace}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={undoRedo.canUndo()}
            canRedo={undoRedo.canRedo()}
          />
        </View>
      </View>

      {/* Error Modal */}
      <ErrorModal
        visible={calculatorState.error}
        errorMessage={calculatorState.errorMessage}
        onDismiss={calculatorHandleAllClear}
        onUndo={handleErrorUndo}
        showUndoButton={true}
      />
    </SafeAreaView>
  );
}
