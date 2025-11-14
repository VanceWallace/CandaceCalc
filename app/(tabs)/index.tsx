/**
 * Main Calculator Screen
 * Retro 1980s calculator for checkbook balancing
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

// Components
import { Display } from '@/components/calculator/Display';
import { ButtonGrid } from '@/components/calculator/ButtonGrid';
import { ReceiptTape } from '@/components/calculator/ReceiptTape';
import { ErrorModal } from '@/components/calculator/ErrorModal';
import { UndoRedoIndicator } from '@/components/calculator/UndoRedoIndicator';
import { ModeSwitch } from '@/components/calculator/ModeSwitch';

// Hooks
import { useCalculator } from '@/hooks/calculator/useCalculator';
import { useUndoRedo } from '@/hooks/calculator/useUndoRedo';

// Utils and constants
import { CalculatorEngine } from '@/utils/calculator';
import { RetroColors } from '@/constants/Colors';
import {
  loadSettings,
  getHistory,
  saveCalculationToHistory,
  autoCleanupHistory,
  saveLastBalance,
} from '@/utils/storage';
import { CalculatorEngine as CalcEngine } from '@/utils/calculator';
import { CalculationHistory, AppSettings, CalculatorState } from '@/types/calculator';

export default function CalculatorScreen() {
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
  const [showModeWarning, setShowModeWarning] = useState(false);
  const [newMode, setNewMode] = useState<'checkbook' | 'scientific'>('checkbook');

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
   * Save state to undo/redo stack when it changes
   */
  useEffect(() => {
    undoRedo.pushState(calculator.state);
  }, [calculator.state]);

  /**
   * Handle number button press
   */
  const handleNumberPress = useCallback((digit: string) => {
    calculator.handleNumberPress(digit);
  }, [calculator]);

  /**
   * Handle decimal press
   */
  const handleDecimal = useCallback(() => {
    calculator.handleDecimal();
  }, [calculator]);

  /**
   * Handle operator press
   */
  const handleOperatorPress = useCallback((op: string) => {
    calculator.handleOperatorPress(op as any);
  }, [calculator]);

  /**
   * Handle equals - this should also save to history
   */
  const handleEquals = useCallback(async () => {
    const prevState = calculator.state;
    calculator.handleEquals();

    // After equals, save to history if successful
    setTimeout(() => {
      if (!calculator.state.error && calculator.state.operation === null) {
        const expression = CalcEngine.formatExpression(
          prevState.previousValue || 0,
          prevState.operation,
          CalcEngine.getDisplayValue(prevState.display),
          settings.currencySymbol
        );

        const result = CalcEngine.getDisplayValue(calculator.state.display);
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
    }, 0);
  }, [calculator, settings]);

  /**
   * Handle undo
   */
  const handleUndo = useCallback(() => {
    if (undoRedo.canUndo()) {
      undoRedo.undo((newState) => {
        calculator.restoreState(newState);
      });
    }
  }, [calculator, undoRedo]);

  /**
   * Handle redo
   */
  const handleRedo = useCallback(() => {
    if (undoRedo.canRedo()) {
      undoRedo.redo((newState) => {
        calculator.restoreState(newState);
      });
    }
  }, [calculator, undoRedo]);

  /**
   * Handle mode change
   */
  const handleModeChange = useCallback(
    (newMode: 'checkbook' | 'scientific') => {
      if (settings.showModeWarning) {
        setNewMode(newMode);
        setShowModeWarning(true);
      } else {
        // Silently switch mode
        setSettings((prev) => ({ ...prev, mode: newMode }));
      }
    },
    [settings.showModeWarning]
  );

  /**
   * Handle history item select
   */
  const handleHistoryItemSelect = useCallback((item: CalculationHistory) => {
    // Restore the calculation result to display
    calculator.restoreState({
      display: item.displayResult,
      expression: item.expression,
      previousValue: null,
      operation: null,
      waitingForOperand: true,
      error: false,
      errorMessage: '',
    });
  }, [calculator]);

  /**
   * Handle error modal undo
   */
  const handleErrorUndo = useCallback(() => {
    calculator.handleAllClear();
    handleUndo();
  }, [calculator, handleUndo]);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: RetroColors.casingBeige,
    },
    container: {
      flex: 1,
      backgroundColor: RetroColors.casingBeige,
    },
    contentContainer: {
      flexGrow: 1,
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 8,
    },
    receiptSection: {
      minHeight: 150,
      marginBottom: 12,
    },
    displaySection: {
      marginBottom: 8,
    },
    buttonSection: {
      flex: 1,
      justifyContent: 'flex-end',
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
            value={calculator.state.display}
            expression={calculator.state.expression}
            error={calculator.state.error}
            errorMessage={calculator.state.errorMessage}
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
            onClear={calculator.handleClear}
            onAllClear={calculator.handleAllClear}
            onBackspace={calculator.handleBackspace}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onNegativeToggle={calculator.handleNegative}
            canUndo={undoRedo.canUndo()}
            canRedo={undoRedo.canRedo()}
          />
        </View>
      </View>

      {/* Error Modal */}
      <ErrorModal
        visible={calculator.state.error}
        errorMessage={calculator.state.errorMessage}
        onDismiss={() => calculator.handleAllClear()}
        onUndo={handleErrorUndo}
        showUndoButton={true}
      />

      {/* Mode Switch Warning */}
      <ModeSwitch
        visible={showModeWarning}
        newMode={newMode}
        onDismiss={() => {
          setShowModeWarning(false);
          setSettings((prev) => ({ ...prev, mode: newMode }));
        }}
      />
    </SafeAreaView>
  );
}
