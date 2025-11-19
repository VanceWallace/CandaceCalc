/**
 * Unit tests for CalculatorEngine
 * Tests all calculation logic, formatting, and edge cases
 */

import { CalculatorEngine } from '@/utils/calculator';
import { Operation, CalculatorMode } from '@/types/calculator';

describe('CalculatorEngine', () => {
  describe('calculate', () => {
    describe('basic operations', () => {
      test('should add two numbers correctly', () => {
        const result = CalculatorEngine.calculate(5, '+', 3, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(8.00);
      });

      test('should subtract two numbers correctly', () => {
        const result = CalculatorEngine.calculate(10, '-', 3, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(7.00);
      });

      test('should multiply two numbers correctly', () => {
        const result = CalculatorEngine.calculate(4, '×', 3, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(12.00);
      });

      test('should divide two numbers correctly', () => {
        const result = CalculatorEngine.calculate(10, '÷', 2, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(5.00);
      });
    });

    describe('error handling', () => {
      test('should return error when dividing by zero', () => {
        const result = CalculatorEngine.calculate(10, '÷', 0, 'checkbook');
        expect(result.error).toBe(true);
        expect(result.errorMessage).toContain('divide by zero');
        expect(result.result).toBe(0);
      });

      test('should return error when result exceeds maximum value', () => {
        const result = CalculatorEngine.calculate(999999999, '+', 1, 'checkbook');
        expect(result.error).toBe(true);
        expect(result.errorMessage).toContain('too large');
        expect(result.result).toBe(0);
      });

      test('should return error when result is negative and exceeds minimum value', () => {
        const result = CalculatorEngine.calculate(-999999999, '-', 1, 'checkbook');
        expect(result.error).toBe(true);
        expect(result.errorMessage).toContain('too large');
      });

      test('should NOT error for maximum valid value', () => {
        const result = CalculatorEngine.calculate(999999999, '+', 0.99, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(999999999.99);
      });
    });

    describe('mode-specific rounding', () => {
      test('should round to 2 decimals in checkbook mode', () => {
        const result = CalculatorEngine.calculate(10, '÷', 3, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(3.33);
      });

      test('should round to 8 decimals in scientific mode', () => {
        const result = CalculatorEngine.calculate(10, '÷', 3, 'scientific');
        expect(result.error).toBe(false);
        expect(result.result).toBe(3.33333333);
      });

      test('should handle exact divisions in checkbook mode', () => {
        const result = CalculatorEngine.calculate(10, '÷', 5, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(2.00);
      });
    });

    describe('negative numbers', () => {
      test('should handle negative first operand', () => {
        const result = CalculatorEngine.calculate(-5, '+', 3, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(-2.00);
      });

      test('should handle negative second operand', () => {
        const result = CalculatorEngine.calculate(5, '+', -3, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(2.00);
      });

      test('should handle both operands negative', () => {
        const result = CalculatorEngine.calculate(-5, '×', -3, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(15.00);
      });
    });

    describe('decimal numbers', () => {
      test('should handle decimal addition', () => {
        const result = CalculatorEngine.calculate(1.5, '+', 2.3, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(3.80);
      });

      test('should handle decimal multiplication', () => {
        const result = CalculatorEngine.calculate(1.5, '×', 2.5, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(3.75);
      });
    });

    describe('edge cases', () => {
      test('should handle zero operands', () => {
        const result = CalculatorEngine.calculate(0, '+', 0, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(0.00);
      });

      test('should handle null operation', () => {
        const result = CalculatorEngine.calculate(5, null as any, 3, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(0);
      });

      test('should handle very small numbers', () => {
        const result = CalculatorEngine.calculate(0.01, '+', 0.01, 'checkbook');
        expect(result.error).toBe(false);
        expect(result.result).toBe(0.02);
      });
    });
  });

  describe('roundToMode', () => {
    test('should round to 2 decimals in checkbook mode', () => {
      expect(CalculatorEngine.roundToMode(3.14159, 'checkbook')).toBe(3.14);
      expect(CalculatorEngine.roundToMode(3.145, 'checkbook')).toBe(3.15);
      expect(CalculatorEngine.roundToMode(3.144, 'checkbook')).toBe(3.14);
    });

    test('should round to 8 decimals in scientific mode', () => {
      expect(CalculatorEngine.roundToMode(3.141592653589793, 'scientific')).toBe(3.14159265);
    });

    test('should handle whole numbers', () => {
      expect(CalculatorEngine.roundToMode(5, 'checkbook')).toBe(5.00);
      expect(CalculatorEngine.roundToMode(5, 'scientific')).toBe(5.00000000);
    });
  });

  describe('formatForDisplay', () => {
    test('should format number with correct decimal places in checkbook mode', () => {
      const result = CalculatorEngine.formatForDisplay(12.5, 'checkbook');
      expect(result).toBe('12.50');
    });

    test('should format number with correct decimal places in scientific mode', () => {
      const result = CalculatorEngine.formatForDisplay(12.5, 'scientific');
      expect(result).toBe('12.50000000');
    });

    test('should add currency symbol in checkbook mode', () => {
      const result = CalculatorEngine.formatForDisplay(12.50, 'checkbook', '$');
      expect(result).toBe('$12.50');
    });

    test('should NOT add currency symbol in scientific mode', () => {
      const result = CalculatorEngine.formatForDisplay(12.50, 'scientific', '$');
      expect(result).toBe('12.50000000');
    });

    test('should truncate display at MAX_DISPLAY_LENGTH', () => {
      const longNumber = '123456789012345678';
      const result = CalculatorEngine.formatForDisplay(longNumber, 'checkbook');
      expect(result.length).toBeLessThanOrEqual(16); // 15 chars + ellipsis
      expect(result).toContain('…');
    });

    test('should handle string input', () => {
      const result = CalculatorEngine.formatForDisplay('42', 'checkbook');
      expect(result).toBe('42');
    });

    test('should handle zero', () => {
      const result = CalculatorEngine.formatForDisplay(0, 'checkbook');
      expect(result).toBe('0.00');
    });
  });

  describe('getDisplayValue', () => {
    test('should parse valid positive numbers', () => {
      expect(CalculatorEngine.getDisplayValue('123.45')).toBe(123.45);
      expect(CalculatorEngine.getDisplayValue('42')).toBe(42);
      expect(CalculatorEngine.getDisplayValue('0.5')).toBe(0.5);
    });

    test('should parse valid negative numbers', () => {
      expect(CalculatorEngine.getDisplayValue('-123.45')).toBe(-123.45);
      expect(CalculatorEngine.getDisplayValue('-42')).toBe(-42);
    });

    test('should return 0 for invalid input', () => {
      expect(CalculatorEngine.getDisplayValue('invalid')).toBe(0);
      expect(CalculatorEngine.getDisplayValue('abc')).toBe(0);
      expect(CalculatorEngine.getDisplayValue('')).toBe(0);
      expect(CalculatorEngine.getDisplayValue('-')).toBe(0);
    });

    test('should handle edge cases', () => {
      expect(CalculatorEngine.getDisplayValue('0')).toBe(0);
      expect(CalculatorEngine.getDisplayValue('0.0')).toBe(0);
      expect(CalculatorEngine.getDisplayValue('.5')).toBe(0.5);
    });
  });

  describe('isValidNumber', () => {
    test('should validate correct numbers', () => {
      expect(CalculatorEngine.isValidNumber('123')).toBe(true);
      expect(CalculatorEngine.isValidNumber('123.45')).toBe(true);
      expect(CalculatorEngine.isValidNumber('-123.45')).toBe(true);
      expect(CalculatorEngine.isValidNumber('0')).toBe(true);
      expect(CalculatorEngine.isValidNumber('.5')).toBe(true);
    });

    test('should reject invalid numbers', () => {
      expect(CalculatorEngine.isValidNumber('abc')).toBe(false);
      expect(CalculatorEngine.isValidNumber('')).toBe(false);
      expect(CalculatorEngine.isValidNumber('12.34.56')).toBe(false);
    });

    test('should reject infinity', () => {
      expect(CalculatorEngine.isValidNumber('Infinity')).toBe(false);
      expect(CalculatorEngine.isValidNumber('-Infinity')).toBe(false);
    });
  });

  describe('formatExpression', () => {
    test('should format complete expression with operation', () => {
      const result = CalculatorEngine.formatExpression(12, '+', 5, '$');
      expect(result).toBe('$12.00 + $5.00');
    });

    test('should format expression with subtraction', () => {
      const result = CalculatorEngine.formatExpression(100, '-', 25, '$');
      expect(result).toBe('$100.00 - $25.00');
    });

    test('should format expression with multiplication', () => {
      const result = CalculatorEngine.formatExpression(4, '×', 3, '$');
      expect(result).toBe('$4.00 × $3.00');
    });

    test('should format expression with division', () => {
      const result = CalculatorEngine.formatExpression(10, '÷', 2, '$');
      expect(result).toBe('$10.00 ÷ $2.00');
    });

    test('should handle null second value', () => {
      const result = CalculatorEngine.formatExpression(12, '+', null, '$');
      expect(result).toBe('$12.00');
    });

    test('should use custom currency symbol', () => {
      const result = CalculatorEngine.formatExpression(12, '+', 5, '€');
      expect(result).toBe('€12.00 + €5.00');
    });
  });

  describe('isInteger', () => {
    test('should identify integers', () => {
      expect(CalculatorEngine.isInteger(5)).toBe(true);
      expect(CalculatorEngine.isInteger(0)).toBe(true);
      expect(CalculatorEngine.isInteger(-10)).toBe(true);
    });

    test('should identify non-integers', () => {
      expect(CalculatorEngine.isInteger(5.5)).toBe(false);
      expect(CalculatorEngine.isInteger(0.1)).toBe(false);
      expect(CalculatorEngine.isInteger(-10.5)).toBe(false);
    });
  });

  describe('getDecimalPlaces', () => {
    test('should count decimal places correctly', () => {
      expect(CalculatorEngine.getDecimalPlaces(5)).toBe(0);
      expect(CalculatorEngine.getDecimalPlaces(5.5)).toBe(1);
      expect(CalculatorEngine.getDecimalPlaces(5.55)).toBe(2);
      expect(CalculatorEngine.getDecimalPlaces(5.123456)).toBe(6);
    });

    test('should handle zero', () => {
      expect(CalculatorEngine.getDecimalPlaces(0)).toBe(0);
      expect(CalculatorEngine.getDecimalPlaces(0.0)).toBe(0);
    });
  });
});
