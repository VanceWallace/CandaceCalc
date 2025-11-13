/**
 * Calculator types and interfaces
 */

export type CalculatorMode = 'checkbook' | 'scientific';
export type Operation = '+' | '-' | '×' | '÷' | null;
export type LcdColor = 'amber' | 'green';

export interface CalculationHistory {
  id: string;
  expression: string;
  result: number;
  timestamp: number;
  displayResult: string; // Formatted result for display
}

export interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: Operation | null;
  waitingForOperand: boolean;
  error: boolean;
  errorMessage: string;
}

export interface UndoRedoState {
  currentIndex: number;
  states: CalculatorState[];
  maxStates: number;
}

export interface AppSettings {
  mode: CalculatorMode;
  lcdColor: LcdColor;
  soundEnabled: boolean;
  retentionDays: 30 | 60 | 90;
  currencySymbol: string;
  showModeWarning: boolean;
}

export interface HistoryItemProps {
  item: CalculationHistory;
  onSelect: (item: CalculationHistory) => void;
}

export interface ReceiptTapeProps {
  history: CalculationHistory[];
  onHistoryItemSelect: (item: CalculationHistory) => void;
  isLoading: boolean;
}
