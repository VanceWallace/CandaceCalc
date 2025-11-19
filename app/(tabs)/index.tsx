/**
 * Main Calculator Screen
 * Retro 1980s calculator for checkbook balancing
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, StatusBar, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { Display } from '@/components/calculator/Display';
import { ButtonGrid } from '@/components/calculator/ButtonGrid';
import { ReceiptTape } from '@/components/calculator/ReceiptTape';
import { ErrorModal } from '@/components/calculator/ErrorModal';
import { UndoRedoIndicator } from '@/components/calculator/UndoRedoIndicator';
import { ModeSwitch } from '@/components/calculator/ModeSwitch';

// Hooks
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
import { CalculationHistory, AppSettings, CalculatorState, Operation } from '@/types/calculator';

// Initial calculator state
const INITIAL_CALCULATOR_STATE: CalculatorState = {
  display: '0',
  expression: '',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  error: false,
  errorMessage: '',
};

export default function CalculatorScreen() {
  // Settings and UI state
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

  // Calculator state - inlined from useCalculator hook
  const [calculatorState, setCalculatorState] = useState<CalculatorState>(INITIAL_CALCULATOR_STATE);

  // Undo/Redo functionality
  const undoRedo = useUndoRedo(calculatorState);

  // Get screen dimensions for responsive layout
  const { height: screenHeight } = useWindowDimensions();

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
   * Track calculator state changes for undo/redo
   */
  const prevStateRef = useRef<CalculatorState | null>(null);
  useEffect(() => {
    if (prevStateRef.current === null) {
      prevStateRef.current = calculatorState;
      return;
    }

    const stateChanged =
      prevStateRef.current.display !== calculatorState.display ||
      prevStateRef.current.operation !== calculatorState.operation ||
      prevStateRef.current.previousValue !== calculatorState.previousValue;

    if (stateChanged && !calculatorState.error) {
      undoRedo.pushState(calculatorState);
      prevStateRef.current = calculatorState;
    }
  }, [calculatorState, undoRedo.pushState]);

  /**
   * Handle number button press
   */
  const handleNumberPress = (digit: string) => {
    setCalculatorState((prev: CalculatorState) => {
      if (prev.error) {
        return {
          ...INITIAL_CALCULATOR_STATE,
          display: digit,
          waitingForOperand: false,
        };
      }

      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: digit,
          waitingForOperand: false,
        };
      }

      const potentialDisplay = prev.display === '0' && digit !== '.'
        ? digit
        : prev.display + digit;

      const potentialValue = CalculatorEngine.getDisplayValue(potentialDisplay);
      if (Math.abs(potentialValue) > 999999999.99) {
        return prev;
      }

      return {
        ...prev,
        display: potentialDisplay,
      };
    });
  };

  /**
   * Handle decimal point press
   */
  const handleDecimal = () => {
    setCalculatorState((prev: CalculatorState) => {
      if (prev.error) {
        return {
          ...INITIAL_CALCULATOR_STATE,
          display: '0.',
        };
      }

      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: '0.',
          waitingForOperand: false,
        };
      }

      if (prev.display.includes('.')) {
        return prev;
      }

      return {
        ...prev,
        display: prev.display + '.',
      };
    });
  };

  /**
   * Handle operator button press
   */
  const handleOperatorPress = (op: string) => {
    const newOperation = op as Operation;

    setCalculatorState((prev: CalculatorState) => {
      if (prev.error) {
        return prev;
      }

      const currentValue = CalculatorEngine.getDisplayValue(prev.display);
      const operatorSymbol = newOperation || '';

      // If we have a previous value and operation, calculate first
      if (prev.previousValue !== null && prev.operation && !prev.waitingForOperand) {
        const { result, error, errorMessage } = CalculatorEngine.calculate(
          prev.previousValue,
          prev.operation,
          currentValue,
          settings.mode
        );

        if (error) {
          return {
            ...prev,
            error: true,
            errorMessage,
            display: '0',
            expression: '',
          };
        }

        const displayResult = CalculatorEngine.formatForDisplay(result, settings.mode);
        const newExpression = `${displayResult} ${operatorSymbol}`;

        return {
          ...prev,
          display: displayResult,
          expression: newExpression,
          previousValue: result,
          operation: newOperation,
          waitingForOperand: true,
          error: false,
          errorMessage: '',
        };
      }

      // No previous value yet, store current value
      const newExpression = `${prev.display} ${operatorSymbol}`;
      return {
        ...prev,
        previousValue: currentValue,
        expression: newExpression,
        operation: newOperation,
        waitingForOperand: true,
        error: false,
        errorMessage: '',
      };
    });
  };

  /**
   * Handle equals button press and save to history
   */
  const handleEquals = () => {
    setCalculatorState((prev: CalculatorState) => {
      if (prev.error || prev.operation === null || prev.previousValue === null) {
        return prev;
      }

      const currentValue = CalculatorEngine.getDisplayValue(prev.display);
      const { result, error, errorMessage } = CalculatorEngine.calculate(
        prev.previousValue,
        prev.operation,
        currentValue,
        settings.mode
      );

      if (error) {
        return {
          ...prev,
          error: true,
          errorMessage,
          display: '0',
          expression: '',
          waitingForOperand: true,
        };
      }

      const displayResult = CalculatorEngine.formatForDisplay(result, settings.mode);
      const fullExpression = `${prev.expression} ${prev.display} = ${displayResult}`;

      // Save to history asynchronously
      const expression = CalculatorEngine.formatExpression(
        prev.previousValue,
        prev.operation,
        currentValue,
        settings.currencySymbol
      );

      saveCalculationToHistory(expression, result, displayResult)
        .then((newItem) => {
          if (newItem) {
            setHistory((prevHistory: CalculationHistory[]) => [newItem, ...prevHistory]);
            if (settings.mode === 'checkbook') {
              saveLastBalance(result);
            }
          }
        })
        .catch((error) => console.error('Error saving to history:', error));

      return {
        ...prev,
        display: displayResult,
        expression: fullExpression,
        previousValue: result,
        operation: null,
        waitingForOperand: true,
        error: false,
        errorMessage: '',
      };
    });
  };

  /**
   * Handle backspace
   */
  const handleBackspace = () => {
    setCalculatorState((prev: CalculatorState) => {
      if (prev.error || prev.waitingForOperand) {
        return prev;
      }

      const newDisplay = prev.display.slice(0, -1) || '0';
      return {
        ...prev,
        display: newDisplay,
      };
    });
  };

  /**
   * Handle Clear (C) - Clear current input
   */
  const handleClear = () => {
    setCalculatorState((prev: CalculatorState) => ({
      ...prev,
      display: '0',
      waitingForOperand: true,
      error: false,
      errorMessage: '',
    }));
  };

  /**
   * Handle All Clear (AC) - Reset everything
   */
  const handleAllClear = () => {
    setCalculatorState(INITIAL_CALCULATOR_STATE);
  };

  /**
   * Handle positive/negative toggle
   */
  const handleNegative = () => {
    setCalculatorState((prev: CalculatorState) => {
      if (prev.error) return prev;

      const value = CalculatorEngine.getDisplayValue(prev.display);
      const toggled = -value;
      const display = toggled === 0 ? '0' : toggled.toString();

      return {
        ...prev,
        display,
      };
    });
  };

  /**
   * Restore calculator state (for undo/redo)
   */
  const restoreState = (newState: CalculatorState) => {
    setCalculatorState(newState);
  };

  /**
   * Handle undo
   */
  const handleUndo = () => {
    if (undoRedo.canUndo()) {
      undoRedo.undo(restoreState);
    }
  };

  /**
   * Handle redo
   */
  const handleRedo = () => {
    if (undoRedo.canRedo()) {
      undoRedo.redo(restoreState);
    }
  };

  /**
   * Handle mode change
   */
  const handleModeChange = (mode: 'checkbook' | 'scientific') => {
    if (settings.showModeWarning) {
      setNewMode(mode);
      setShowModeWarning(true);
    } else {
      setSettings((prev: AppSettings) => ({ ...prev, mode }));
    }
  };

  /**
   * Handle history item selection
   */
  const handleHistoryItemSelect = (item: CalculationHistory) => {
    setCalculatorState({
      display: item.displayResult,
      expression: item.expression,
      previousValue: null,
      operation: null,
      waitingForOperand: true,
      error: false,
      errorMessage: '',
    });
  };

  /**
   * Handle error modal undo
   */
  const handleErrorUndo = () => {
    handleAllClear();
    handleUndo();
  };

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
            onClear={handleClear}
            onAllClear={handleAllClear}
            onBackspace={handleBackspace}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onNegativeToggle={handleNegative}
            canUndo={undoRedo.canUndo()}
            canRedo={undoRedo.canRedo()}
          />
        </View>
      </View>

      {/* Error Modal */}
      <ErrorModal
        visible={calculatorState.error}
        errorMessage={calculatorState.errorMessage}
        onDismiss={handleAllClear}
        onUndo={handleErrorUndo}
        showUndoButton={true}
      />

      {/* Mode Switch Warning */}
      <ModeSwitch
        visible={showModeWarning}
        newMode={newMode}
        onDismiss={() => {
          setShowModeWarning(false);
          setSettings((prev: AppSettings) => ({ ...prev, mode: newMode }));
        }}
      />
    </SafeAreaView>
  );
}
