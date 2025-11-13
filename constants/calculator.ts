/**
 * Calculator configuration and layout
 */

export const BUTTON_SIZE = 70;
export const BUTTON_GAP = 8;
export const MAX_DISPLAY_LENGTH = 15;
export const DECIMAL_PLACES_CHECKBOOK = 2;
export const DECIMAL_PLACES_SCIENTIFIC = 8;
export const UNDO_REDO_STACK_SIZE = 20;
export const UNDO_REDO_TIMEOUT = 5000; // 5 seconds for older users
export const ERROR_MESSAGE_TIMEOUT = 5000; // 5 seconds
export const MODE_SWITCH_TIMEOUT = 5000; // 5 seconds

// Checkbook mode button layout
export const CHECKBOOK_LAYOUT = [
  ['7', '8', '9', '÷', '←'],
  ['4', '5', '6', '×', '↶'],
  ['1', '2', '3', '-', '↷'],
  ['0', '.', '+/-', '+', '='],
  ['AC', 'C', 'M+', 'M-', 'MR'],
];

// Scientific mode button layout (expanded)
export const SCIENTIFIC_LAYOUT = [
  ['√', '%', 'x²', '(', ')'],
  ['7', '8', '9', '÷', '←'],
  ['4', '5', '6', '×', '↶'],
  ['1', '2', '3', '-', '↷'],
  ['0', '.', '+/-', '+', '='],
  ['AC', 'C', 'M+', 'M-', 'MR'],
];

// Button type categories for styling
export const BUTTON_TYPES = {
  NUMBER: 'number',
  OPERATOR: 'operator',
  EQUALS: 'equals',
  FUNCTION: 'function',
  CONTROL: 'control',
  MEMORY: 'memory',
  UNDO_REDO: 'undo-redo',
} as const;

// Button categorization
export const BUTTON_CATEGORIES: Record<string, string> = {
  // Numbers
  '0': BUTTON_TYPES.NUMBER,
  '1': BUTTON_TYPES.NUMBER,
  '2': BUTTON_TYPES.NUMBER,
  '3': BUTTON_TYPES.NUMBER,
  '4': BUTTON_TYPES.NUMBER,
  '5': BUTTON_TYPES.NUMBER,
  '6': BUTTON_TYPES.NUMBER,
  '7': BUTTON_TYPES.NUMBER,
  '8': BUTTON_TYPES.NUMBER,
  '9': BUTTON_TYPES.NUMBER,
  '.': BUTTON_TYPES.FUNCTION,
  '+/-': BUTTON_TYPES.FUNCTION,

  // Operators
  '+': BUTTON_TYPES.OPERATOR,
  '-': BUTTON_TYPES.OPERATOR,
  '×': BUTTON_TYPES.OPERATOR,
  '÷': BUTTON_TYPES.OPERATOR,

  // Equals
  '=': BUTTON_TYPES.EQUALS,

  // Control
  'AC': BUTTON_TYPES.CONTROL,
  'C': BUTTON_TYPES.CONTROL,
  '←': BUTTON_TYPES.CONTROL,

  // Undo/Redo
  '↶': BUTTON_TYPES.UNDO_REDO,
  '↷': BUTTON_TYPES.UNDO_REDO,

  // Memory
  'M+': BUTTON_TYPES.MEMORY,
  'M-': BUTTON_TYPES.MEMORY,
  'MR': BUTTON_TYPES.MEMORY,

  // Scientific
  '√': BUTTON_TYPES.FUNCTION,
  '%': BUTTON_TYPES.FUNCTION,
  'x²': BUTTON_TYPES.FUNCTION,
  '(': BUTTON_TYPES.FUNCTION,
  ')': BUTTON_TYPES.FUNCTION,
};

// Sound effect configuration
export const SOUNDS = {
  BUTTON_TAP: 'button-tap',
  PRINTER: 'printer',
} as const;

// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
  HISTORY: 'calculator_history',
  SETTINGS: 'calculator_settings',
  LAST_BALANCE: 'last_balance',
} as const;

// Currency symbols
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
} as const;
