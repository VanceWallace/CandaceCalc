/**
 * Unit tests for useCalculator hook
 * Tests calculator state management and user interactions
 */

import { renderHook, act } from '@testing-library/react-native';
import { useCalculator } from '@/hooks/calculator/useCalculator';
import { CalculatorEngine } from '@/utils/calculator';

describe('useCalculator', () => {
  describe('initialization', () => {
    test('should initialize with default state', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      expect(result.current.state.display).toBe('0');
      expect(result.current.state.expression).toBe('');
      expect(result.current.state.previousValue).toBeNull();
      expect(result.current.state.operation).toBeNull();
      expect(result.current.state.waitingForOperand).toBe(false);
      expect(result.current.state.error).toBe(false);
      expect(result.current.state.errorMessage).toBe('');
    });
  });

  describe('number input', () => {
    test('should handle single digit entry', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
      });

      expect(result.current.state.display).toBe('5');
    });

    test('should handle multiple digit entry', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleNumberPress('0');
      });

      expect(result.current.state.display).toBe('50');
    });

    test('should replace leading zero with digit', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
      });

      expect(result.current.state.display).toBe('5');
    });

    test('should prevent input that exceeds maximum value', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      // Type 999,999,999.99
      act(() => {
        '999999999'.split('').forEach(digit => {
          result.current.handleNumberPress(digit);
        });
      });

      const displayValue = CalculatorEngine.getDisplayValue(result.current.state.display);
      expect(displayValue).toBeLessThanOrEqual(999999999.99);

      // Try to add one more digit - should be rejected
      const displayBefore = result.current.state.display;
      act(() => {
        result.current.handleNumberPress('9');
      });
      expect(result.current.state.display).toBe(displayBefore);
    });

    test('should start new number after waiting for operand', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleOperatorPress('+');
        result.current.handleNumberPress('3');
      });

      expect(result.current.state.display).toBe('3');
    });

    test('should clear error and start new number on digit press', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      // Create error state by dividing by zero
      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleOperatorPress('÷');
        result.current.handleNumberPress('0');
        result.current.handleEquals();
      });

      expect(result.current.state.error).toBe(true);

      // Press a digit
      act(() => {
        result.current.handleNumberPress('7');
      });

      expect(result.current.state.error).toBe(false);
      expect(result.current.state.display).toBe('7');
    });
  });

  describe('decimal input', () => {
    test('should add decimal point', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleDecimal();
        result.current.handleNumberPress('5');
      });

      expect(result.current.state.display).toBe('5.5');
    });

    test('should prevent multiple decimal points', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleDecimal();
        result.current.handleDecimal(); // Second decimal should be ignored
        result.current.handleNumberPress('5');
      });

      expect(result.current.state.display).toBe('5.5');
    });

    test('should start with "0." when waiting for operand', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleOperatorPress('+');
        result.current.handleDecimal();
      });

      expect(result.current.state.display).toBe('0.');
    });
  });

  describe('operations', () => {
    test('should perform basic addition', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleOperatorPress('+');
        result.current.handleNumberPress('3');
        result.current.handleEquals();
      });

      expect(result.current.state.display).toBe('8.00');
      expect(result.current.state.error).toBe(false);
    });

    test('should perform basic subtraction', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('1');
        result.current.handleNumberPress('0');
        result.current.handleOperatorPress('-');
        result.current.handleNumberPress('3');
        result.current.handleEquals();
      });

      expect(result.current.state.display).toBe('7.00');
    });

    test('should perform basic multiplication', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('4');
        result.current.handleOperatorPress('×');
        result.current.handleNumberPress('3');
        result.current.handleEquals();
      });

      expect(result.current.state.display).toBe('12.00');
    });

    test('should perform basic division', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('1');
        result.current.handleNumberPress('0');
        result.current.handleOperatorPress('÷');
        result.current.handleNumberPress('2');
        result.current.handleEquals();
      });

      expect(result.current.state.display).toBe('5.00');
    });

    test('should handle chained operations', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      // 10 + 5 - 3 =
      act(() => {
        result.current.handleNumberPress('1');
        result.current.handleNumberPress('0');
        result.current.handleOperatorPress('+');
        result.current.handleNumberPress('5');
        result.current.handleOperatorPress('-'); // Should calculate 10+5=15 first
        result.current.handleNumberPress('3');
        result.current.handleEquals();
      });

      expect(result.current.state.display).toBe('12.00');
    });

    test('should build expression when operator is pressed', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleOperatorPress('+');
      });

      expect(result.current.state.expression).toContain('5');
      expect(result.current.state.expression).toContain('+');
      expect(result.current.state.waitingForOperand).toBe(true);
    });

    test('should show complete expression after equals', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleOperatorPress('+');
        result.current.handleNumberPress('3');
        result.current.handleEquals();
      });

      expect(result.current.state.expression).toContain('=');
      expect(result.current.state.expression).toContain('8.00');
    });
  });

  describe('error handling', () => {
    test('should show error for division by zero', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleOperatorPress('÷');
        result.current.handleNumberPress('0');
        result.current.handleEquals();
      });

      expect(result.current.state.error).toBe(true);
      expect(result.current.state.errorMessage).toContain('divide by zero');
    });

    test('should show error when result exceeds maximum', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        '999999999'.split('').forEach(digit => {
          result.current.handleNumberPress(digit);
        });
        result.current.handleOperatorPress('+');
        result.current.handleNumberPress('1');
        result.current.handleEquals();
      });

      expect(result.current.state.error).toBe(true);
      expect(result.current.state.errorMessage).toContain('too large');
    });

    test('should reset display to 0 on error', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleOperatorPress('÷');
        result.current.handleNumberPress('0');
        result.current.handleEquals();
      });

      expect(result.current.state.display).toBe('0');
    });
  });

  describe('clear and reset', () => {
    test('handleClear should clear display and set waiting for operand', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleOperatorPress('+');
        result.current.handleClear();
      });

      expect(result.current.state.display).toBe('0');
      expect(result.current.state.waitingForOperand).toBe(true);
    });

    test('handleAllClear should reset to initial state', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleOperatorPress('+');
        result.current.handleNumberPress('3');
        result.current.handleAllClear();
      });

      expect(result.current.state.display).toBe('0');
      expect(result.current.state.expression).toBe('');
      expect(result.current.state.previousValue).toBeNull();
      expect(result.current.state.operation).toBeNull();
    });
  });

  describe('backspace', () => {
    test('should remove last digit', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleNumberPress('0');
        result.current.handleBackspace();
      });

      expect(result.current.state.display).toBe('5');
    });

    test('should show "0" when all digits are removed', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleBackspace();
      });

      expect(result.current.state.display).toBe('0');
    });

    test('should not work when waiting for operand', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleOperatorPress('+');
        result.current.handleBackspace();
      });

      expect(result.current.state.display).toBe('5');
    });
  });

  describe('negative toggle', () => {
    test('should toggle positive number to negative', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleNegative();
      });

      expect(result.current.state.display).toBe('-5');
    });

    test('should toggle negative number to positive', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
        result.current.handleNegative();
        result.current.handleNegative();
      });

      expect(result.current.state.display).toBe('5');
    });

    test('should handle zero', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNegative();
      });

      expect(result.current.state.display).toBe('0');
    });
  });

  describe('mode differences', () => {
    test('checkbook mode should round to 2 decimals', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('1');
        result.current.handleNumberPress('0');
        result.current.handleOperatorPress('÷');
        result.current.handleNumberPress('3');
        result.current.handleEquals();
      });

      expect(result.current.state.display).toBe('3.33');
    });

    test('scientific mode should round to 8 decimals', () => {
      const { result } = renderHook(() => useCalculator('scientific'));

      act(() => {
        result.current.handleNumberPress('1');
        result.current.handleNumberPress('0');
        result.current.handleOperatorPress('÷');
        result.current.handleNumberPress('3');
        result.current.handleEquals();
      });

      expect(result.current.state.display).toBe('3.33333333');
    });
  });

  describe('state restoration', () => {
    test('restoreState should update calculator state', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      const newState = {
        display: '42',
        expression: '40 + 2 = 42',
        previousValue: 42,
        operation: null,
        waitingForOperand: true,
        error: false,
        errorMessage: '',
      };

      act(() => {
        result.current.restoreState(newState);
      });

      expect(result.current.state.display).toBe('42');
      expect(result.current.state.expression).toBe('40 + 2 = 42');
    });

    test('getStateSnapshot should return current state', () => {
      const { result } = renderHook(() => useCalculator('checkbook'));

      act(() => {
        result.current.handleNumberPress('5');
      });

      const snapshot = result.current.getStateSnapshot();
      expect(snapshot.display).toBe('5');
      expect(snapshot.previousValue).toBeNull();
    });
  });
});
