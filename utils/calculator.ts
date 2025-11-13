/**
 * Calculator engine and math utilities
 */

import { Operation, CalculatorMode } from '@/types/calculator';
import { DECIMAL_PLACES_CHECKBOOK, DECIMAL_PLACES_SCIENTIFIC, MAX_DISPLAY_LENGTH } from '@/constants/calculator';

export class CalculatorEngine {
  /**
   * Perform calculation between two numbers
   */
  static calculate(
    firstValue: number,
    operation: Operation,
    secondValue: number,
    mode: CalculatorMode = 'checkbook'
  ): { result: number; error: boolean; errorMessage: string } {
    if (!operation) {
      return { result: 0, error: false, errorMessage: '' };
    }

    let result: number;

    try {
      switch (operation) {
        case '+':
          result = firstValue + secondValue;
          break;
        case '-':
          result = firstValue - secondValue;
          break;
        case '×':
          result = firstValue * secondValue;
          break;
        case '÷':
          if (secondValue === 0) {
            return {
              result: 0,
              error: true,
              errorMessage: 'Cannot divide by zero. This would create an infinite number. Press C to start fresh or ↶ to undo.',
            };
          }
          result = firstValue / secondValue;
          break;
        default:
          return { result: 0, error: false, errorMessage: '' };
      }

      // Apply precision rounding based on mode
      result = CalculatorEngine.roundToMode(result, mode);

      // Check if result is too large
      if (Math.abs(result) > 999999999.99) {
        return {
          result: 0,
          error: true,
          errorMessage: 'This number is too large to display. The maximum is 999,999,999.99. Press C to start over.',
        };
      }

      return { result, error: false, errorMessage: '' };
    } catch (error) {
      return {
        result: 0,
        error: true,
        errorMessage: 'An error occurred. Press C to start over.',
      };
    }
  }

  /**
   * Round number based on calculator mode
   */
  static roundToMode(value: number, mode: CalculatorMode): number {
    const decimalPlaces = mode === 'checkbook' ? DECIMAL_PLACES_CHECKBOOK : DECIMAL_PLACES_SCIENTIFIC;
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(value * factor) / factor;
  }

  /**
   * Format number for display
   */
  static formatForDisplay(
    value: string | number,
    mode: CalculatorMode,
    currencySymbol: string = ''
  ): string {
    if (typeof value === 'number') {
      const decimalPlaces = mode === 'checkbook' ? DECIMAL_PLACES_CHECKBOOK : DECIMAL_PLACES_SCIENTIFIC;
      value = value.toFixed(decimalPlaces);
    }

    let display = value.toString();

    // Truncate if too long for display
    if (display.length > MAX_DISPLAY_LENGTH) {
      display = display.substring(0, MAX_DISPLAY_LENGTH) + '…';
    }

    // Add currency symbol if needed
    if (currencySymbol && mode === 'checkbook') {
      display = currencySymbol + display;
    }

    return display;
  }

  /**
   * Format calculation expression for history
   */
  static formatExpression(
    firstValue: number,
    operation: Operation,
    secondValue: number | null,
    currencySymbol: string = '$'
  ): string {
    const formatNumber = (n: number) => {
      return currencySymbol + n.toFixed(2);
    };

    if (operation && secondValue !== null && secondValue !== undefined) {
      return `${formatNumber(firstValue)} ${operation} ${formatNumber(secondValue)}`;
    }

    return formatNumber(firstValue);
  }

  /**
   * Validate if a string is a valid number
   */
  static isValidNumber(str: string): boolean {
    return !isNaN(parseFloat(str)) && isFinite(parseFloat(str));
  }

  /**
   * Get display value from string, handling multiple decimals and negatives
   */
  static getDisplayValue(displayStr: string): number {
    if (!displayStr || displayStr === '-') return 0;
    const num = parseFloat(displayStr);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Check if a number is an integer
   */
  static isInteger(value: number): boolean {
    return Number.isInteger(value);
  }

  /**
   * Get the number of decimal places in a number
   */
  static getDecimalPlaces(value: number): number {
    const match = value.toString().match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) return 0;
    return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
  }
}
