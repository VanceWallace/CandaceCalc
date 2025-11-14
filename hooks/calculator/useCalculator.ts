/**
 * Main calculator logic hook
 * Handles all calculation operations, state management, and validation
 */

import { useState, useCallback } from 'react';
import { CalculatorState, Operation, CalculatorMode } from '@/types/calculator';
import { CalculatorEngine } from '@/utils/calculator';
import { MAX_DISPLAY_LENGTH } from '@/constants/calculator';

const INITIAL_STATE: CalculatorState = {
  display: '0',
  expression: '',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  error: false,
  errorMessage: '',
};

export function useCalculator(mode: CalculatorMode = 'checkbook') {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);

  /**
   * Handle number button press
   */
  const handleNumberPress = useCallback((digit: string) => {
    setState((prev) => {
      // If showing error, clear it
      if (prev.error) {
        return {
          ...INITIAL_STATE,
          display: digit,
          waitingForOperand: false,
        };
      }

      // If waiting for operand, start new number
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: digit,
          waitingForOperand: false,
        };
      }

      // Append digit to existing display
      if (prev.display === '0' && digit !== '.') {
        return {
          ...prev,
          display: digit,
        };
      }

      return {
        ...prev,
        display: prev.display + digit,
      };
    });
  }, []);

  /**
   * Handle decimal point
   */
  const handleDecimal = useCallback(() => {
    setState((prev) => {
      // If showing error, clear it
      if (prev.error) {
        return {
          ...INITIAL_STATE,
          display: '0.',
        };
      }

      // If waiting for operand, start with "0."
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: '0.',
          waitingForOperand: false,
        };
      }

      // Don't add decimal if already exists
      if (prev.display.includes('.')) {
        return prev;
      }

      return {
        ...prev,
        display: prev.display + '.',
      };
    });
  }, []);

  /**
   * Handle positive/negative toggle
   */
  const handleNegative = useCallback(() => {
    setState((prev) => {
      if (prev.error) return prev;

      const value = CalculatorEngine.getDisplayValue(prev.display);
      const toggled = -value;
      const display = toggled === 0 ? '0' : toggled.toString();

      return {
        ...prev,
        display,
      };
    });
  }, []);

  /**
   * Handle operator press
   */
  const handleOperatorPress = useCallback((newOperation: Operation) => {
    setState((prev) => {
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
          mode
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

        const displayResult = CalculatorEngine.formatForDisplay(result, mode);
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
  }, [mode]);

  /**
   * Handle equals button
   */
  const handleEquals = useCallback(() => {
    setState((prev) => {
      if (prev.error || prev.operation === null || prev.previousValue === null) {
        return prev;
      }

      const currentValue = CalculatorEngine.getDisplayValue(prev.display);
      const { result, error, errorMessage } = CalculatorEngine.calculate(
        prev.previousValue,
        prev.operation,
        currentValue,
        mode
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

      const displayResult = CalculatorEngine.formatForDisplay(result, mode);
      const fullExpression = `${prev.expression} ${prev.display} = ${displayResult}`;

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
  }, [mode]);

  /**
   * Handle backspace
   */
  const handleBackspace = useCallback(() => {
    setState((prev) => {
      if (prev.error || prev.waitingForOperand) {
        return prev;
      }

      const newDisplay = prev.display.slice(0, -1) || '0';
      return {
        ...prev,
        display: newDisplay,
      };
    });
  }, []);

  /**
   * Handle Clear (C) - Clear current input
   */
  const handleClear = useCallback(() => {
    setState((prev) => ({
      ...prev,
      display: '0',
      waitingForOperand: true,
      error: false,
      errorMessage: '',
    }));
  }, []);

  /**
   * Handle All Clear (AC) - Reset everything
   */
  const handleAllClear = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  /**
   * Get current calculated value from display
   */
  const getCurrentValue = useCallback((): number => {
    return CalculatorEngine.getDisplayValue(state.display);
  }, [state.display]);

  /**
   * Restore state from a previous state (for undo/redo)
   */
  const restoreState = useCallback((newState: CalculatorState) => {
    setState(newState);
  }, []);

  /**
   * Get snapshot of current state (for undo/redo)
   */
  const getStateSnapshot = useCallback((): CalculatorState => {
    return { ...state };
  }, [state]);

  return {
    state,
    handleNumberPress,
    handleDecimal,
    handleNegative,
    handleOperatorPress,
    handleEquals,
    handleBackspace,
    handleClear,
    handleAllClear,
    getCurrentValue,
    restoreState,
    getStateSnapshot,
  };
}
