# Simplifying the Calculator Codebase

## Current Complexity Analysis

### Three Main Views (Current State)

```
1. Display (99 lines) - ✅ Actually reasonable
2. ReceiptTape/History (174 lines) - ⚠️ Could be simpler
3. ButtonGrid (145 lines) - ⚠️ Could be simpler
4. Main Screen (354 lines) - ❌ Way too complex
```

**Total calculator-specific code: ~2,136 lines**

---

## Problem Areas

### 1. **Main Screen (index.tsx) - 354 lines of hook hell**

**Current issues:**
```typescript
// ❌ Callback wrappers everywhere
const handleNumberPress = useCallback((digit: string) => {
  calculatorHandleNumberPress(digit);
}, [calculatorHandleNumberPress]);

const handleDecimal = useCallback(() => {
  calculatorHandleDecimal();
}, [calculatorHandleDecimal]);

const handleOperatorPress = useCallback((op: string) => {
  calculatorHandleOperatorPress(op as any);
}, [calculatorHandleOperatorPress]);

// ❌ Complex ref tracking to prevent loops
const prevStateRef = useRef<CalculatorState | null>(null);
useEffect(() => {
  if (prevStateRef.current === null) {
    prevStateRef.current = calculatorState;
    return;
  }
  // ... complex logic
}, [calculatorState.display, calculatorState.operation, calculatorState.previousValue]);

// ❌ Destructuring to avoid dependency hell
const {
  handleNumberPress: calculatorHandleNumberPress,
  handleDecimal: calculatorHandleDecimal,
  handleOperatorPress: calculatorHandleOperatorPress,
  // ... 10 more functions
} = calculator;
```

**Why is this complex?**
- `useCallback` wrapping simple pass-through functions (unnecessary)
- Refs to track previous state (over-engineered)
- Hook destructuring to avoid dependency issues (fighting React)
- Callbacks wrapping callbacks (double indirection)

---

### 2. **useCalculator Hook (294 lines) - Over-abstraction**

**Current structure:**
- Custom hook with 12 functions
- Each function wrapped in `useCallback`
- Returns giant object with all handlers

**Problem:** For a simple calculator, this is overkill. The logic could live directly in the component.

---

### 3. **ButtonGrid (145 lines) - Routing overhead**

**Current flow:**
```
Button clicked → handleButtonPress() →
  switch statement →
    calls appropriate callback →
      index.tsx wrapper callback →
        useCalculator hook callback →
          actual logic
```

**That's 5 layers of indirection for a button press!**

---

## Simplification Strategy

### Goal: Reduce from 2,136 lines to ~600-700 lines

**Key principles:**
1. ✂️ Remove unnecessary `useCallback` wrappers
2. ✂️ Move calculator logic directly into component
3. ✂️ Self-contained view components (Display, History, Buttons)
4. ✂️ Simple prop passing, no callback hell
5. ✂️ Remove over-abstraction (CalculatorEngine class)

---

## Proposed Simplified Structure

### New File Organization

```
app/(tabs)/
├─ index.tsx                    ~200 lines (was 354)
│   └─ Main screen with calculator state
│
components/calculator/
├─ CalculatorDisplay.tsx         ~60 lines (was 99)
│   └─ Just renders display, no logic
│
├─ CalculatorHistory.tsx         ~80 lines (was 174)
│   └─ Self-contained history view
│
└─ CalculatorButtons.tsx        ~120 lines (was 145 + 154 Button.tsx)
    └─ Buttons + logic in one place

utils/
└─ calculator.ts                 ~60 lines (was 159)
    └─ Pure functions, no class

types/
└─ calculator.ts                 ~40 lines (was 51)

storage.ts                      ~100 lines (was 159)

Total: ~660 lines (vs 2,136)
```

---

## Detailed Refactoring Guide

### 1. Simplify Main Screen (index.tsx)

**BEFORE (354 lines with hooks):**
```typescript
export default function CalculatorScreen() {
  const [settings, setSettings] = useState<AppSettings>({...});
  const [history, setHistory] = useState<CalculationHistory[]>([]);

  // Complex hook usage
  const calculator = useCalculator(settings.mode);
  const undoRedo = useUndoRedo(calculator.state);

  // Destructure to avoid dependencies
  const {
    handleNumberPress: calculatorHandleNumberPress,
    handleDecimal: calculatorHandleDecimal,
    // ... 10 more
  } = calculator;

  // Ref to track state
  const prevStateRef = useRef<CalculatorState | null>(null);
  useEffect(() => {
    // Complex tracking logic
  }, [calculatorState.display, calculatorState.operation, ...]);

  // Wrapper callbacks
  const handleNumberPress = useCallback((digit: string) => {
    calculatorHandleNumberPress(digit);
  }, [calculatorHandleNumberPress]);

  // ... 10 more wrapper callbacks

  return (
    <SafeAreaView>
      {/* Complex JSX */}
    </SafeAreaView>
  );
}
```

**AFTER (~200 lines, no hook hell):**
```typescript
interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: '+' | '-' | '×' | '÷' | null;
  waitingForOperand: boolean;
}

export default function CalculatorScreen() {
  // Simple state - no custom hooks
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
  });

  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load history on mount
  useEffect(() => {
    loadSettings().then(setSettings);
    getHistory().then(setHistory);
  }, []);

  // Simple handler - no useCallback needed
  const handleCalculation = (type: string, value?: string) => {
    setState(prev => {
      switch (type) {
        case 'NUMBER':
          return {
            ...prev,
            display: prev.waitingForOperand ? value! : prev.display + value!,
            waitingForOperand: false,
          };

        case 'OPERATOR':
          const currentValue = parseFloat(prev.display);
          return {
            ...prev,
            previousValue: currentValue,
            operation: value as any,
            waitingForOperand: true,
          };

        case 'EQUALS':
          if (prev.operation && prev.previousValue !== null) {
            const result = calculate(prev.previousValue, prev.operation, parseFloat(prev.display));

            // Save to history
            saveToHistory(prev.previousValue, prev.operation, parseFloat(prev.display), result);

            return {
              display: result.toString(),
              previousValue: null,
              operation: null,
              waitingForOperand: true,
            };
          }
          return prev;

        case 'CLEAR':
          return { display: '0', previousValue: null, operation: null, waitingForOperand: false };

        default:
          return prev;
      }
    });
  };

  const saveToHistory = async (first: number, op: string, second: number, result: number) => {
    const entry = {
      id: Date.now().toString(),
      expression: `${first} ${op} ${second}`,
      result: result,
      timestamp: Date.now(),
    };

    setHistory(prev => [entry, ...prev]);
    await saveCalculationToHistory(entry.expression, result, result.toString());
  };

  return (
    <SafeAreaView style={styles.container}>
      <CalculatorHistory
        history={history}
        onSelectItem={(item) => setState({ display: item.result.toString(), previousValue: null, operation: null, waitingForOperand: true })}
      />

      <CalculatorDisplay
        value={state.display}
        mode={settings.mode}
      />

      <CalculatorButtons
        onAction={handleCalculation}
      />
    </SafeAreaView>
  );
}

// Simple calculation function (no class needed)
function calculate(a: number, op: string, b: number): number {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? 0 : a / b;
    default: return 0;
  }
}
```

**Improvements:**
- ✅ No `useCallback` wrappers
- ✅ No custom hooks
- ✅ No ref tracking
- ✅ Logic lives where it's used
- ✅ Single handler for all button actions
- ✅ 200 lines instead of 354

---

### 2. Simplify Display Component

**BEFORE (99 lines with memoization):**
```typescript
export const Display: React.FC<DisplayProps> = ({
  value,
  expression = '',
  error,
  errorMessage,
  lcdColor = 'amber',
  mode = 'checkbook',
  currencySymbol = '$',
}) => {
  const { width: screenWidth } = useWindowDimensions();

  const displayContent = expression && expression.includes('=') ? expression : value;
  const baseFontSize = Math.min(screenWidth * 0.1, 48);
  const dynamicFontSize = Math.max(baseFontSize - (displayContent.length > 15 ? 15 : 0), 24);

  const lcdPalette = lcdColor === 'amber' ? AmberLcdPalette : GreenLcdPalette;

  // Memoize styles to prevent recreation
  const styles = useMemo(() => ({
    container: { /* 20 lines of style */ },
    displayText: { /* 15 lines of style */ },
    modeLabel: { /* 8 lines of style */ },
  }), [lcdPalette, dynamicFontSize, error]);

  return (
    <View style={styles.container}>
      <Text style={styles.displayText}>{displayContent}</Text>
      <Text style={styles.modeLabel}>{mode === 'checkbook' ? 'CHECKBOOK' : 'SCIENTIFIC'}</Text>
    </View>
  );
};
```

**AFTER (~60 lines, simpler):**
```typescript
interface DisplayProps {
  value: string;
  mode: 'checkbook' | 'scientific';
  error?: string;
}

export function CalculatorDisplay({ value, mode, error }: DisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.display, error && styles.error]}>
        {error || value}
      </Text>
      <Text style={styles.mode}>
        {mode.toUpperCase()}
      </Text>
    </View>
  );
}

// Styles defined once (no memoization needed)
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2A2A1E',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  display: {
    color: '#FFB000',
    fontSize: 36,
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  error: {
    color: '#FF3B30',
  },
  mode: {
    color: '#FFB000',
    fontSize: 10,
    fontFamily: 'monospace',
    opacity: 0.6,
    textAlign: 'right',
  },
});
```

**Improvements:**
- ✅ No `useMemo` (premature optimization)
- ✅ No `useWindowDimensions` (let text scale naturally)
- ✅ Simpler props (removed unnecessary ones)
- ✅ StyleSheet defined once, not recreated
- ✅ 60 lines instead of 99

---

### 3. Simplify History Component

**BEFORE (174 lines with callbacks and memoization):**
```typescript
export const ReceiptTape: React.FC<ReceiptTapeProps> = ({
  history,
  onHistoryItemSelect,
  isLoading = false,
  mode = 'checkbook',
}) => {
  const windowHeight = Dimensions.get('window').height;
  const maxHeight = Math.min(windowHeight * 0.35, 300);

  const isAddition = useCallback((expression: string): boolean => {
    return expression.includes('+') && !expression.includes('-');
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CalculationHistory }) => (
      <HistoryItem
        item={item}
        onPress={() => onHistoryItemSelect(item)}
        isColorCoded={mode === 'checkbook'}
        isAddition={isAddition(item.expression)}
      />
    ),
    [mode, onHistoryItemSelect, isAddition]
  );

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No calculations yet</Text>
    </View>
  ), []);

  const styles = StyleSheet.create({ /* ... */ });

  return (
    <View style={styles.container}>
      {/* Complex FlatList setup */}
    </View>
  );
};
```

**AFTER (~80 lines, simpler):**
```typescript
interface HistoryProps {
  history: Array<{ id: string; expression: string; result: number; timestamp: number }>;
  onSelectItem: (item: any) => void;
}

export function CalculatorHistory({ history, onSelectItem }: HistoryProps) {
  if (history.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No calculations yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>CALCULATION HISTORY</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => onSelectItem(item)}
          >
            <Text style={styles.expression}>{item.expression}</Text>
            <Text style={styles.result}>= {item.result}</Text>
          </TouchableOpacity>
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 200,
    backgroundColor: '#FFF',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#8B7355',
    padding: 8,
  },
  headerText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  expression: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  result: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  empty: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
});
```

**Improvements:**
- ✅ No `useCallback` memoization
- ✅ Inline FlatList renderItem (simpler)
- ✅ Removed separate HistoryItem component (was 92 lines!)
- ✅ Fixed maxHeight instead of dynamic calculation
- ✅ 80 lines instead of 174 + 92 = 266 lines

---

### 4. Simplify Button Grid

**BEFORE (145 lines ButtonGrid + 154 lines Button = 299 lines total):**
```typescript
// ButtonGrid.tsx (145 lines)
export const ButtonGrid: React.FC<ButtonGridProps> = ({
  mode,
  onNumberPress,
  onDecimalPress,
  onOperatorPress,
  onEqualsPress,
  onClear,
  onAllClear,
  onBackspace,
  onUndo,
  onRedo,
  onMemoryAdd,
  onMemorySubtract,
  onMemoryRecall,
  onNegativeToggle,
  canUndo = false,
  canRedo = false,
}) => {
  const handleButtonPress = (label: string) => {
    const numValue = parseInt(label);
    if (!isNaN(numValue)) {
      onNumberPress(label);
    } else {
      switch (label) {
        case '.': onDecimalPress(); break;
        case '+': case '-': case '×': case '÷': onOperatorPress(label); break;
        // ... 15 more cases
      }
    }
  };

  return (
    <View>
      {buttonLayout.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((label) => (
            <Button label={label} onPress={() => handleButtonPress(label)} />
          ))}
        </View>
      ))}
    </View>
  );
};

// Button.tsx (154 lines!)
export const Button: React.FC<ButtonProps> = ({ label, onPress, disabled }) => {
  const variant = getButtonVariant(label);
  const { width: screenWidth } = useWindowDimensions();
  const buttonSize = Math.max(screenWidth * 0.16, 60);

  const styles = StyleSheet.create({
    button: {
      width: buttonSize,
      height: buttonSize,
      // ... 30 lines of styling
    },
    // ... more styles
  });

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};
```

**AFTER (~120 lines total, combined):**
```typescript
interface ButtonsProps {
  onAction: (type: string, value?: string) => void;
}

export function CalculatorButtons({ onAction }: ButtonsProps) {
  const buttons = [
    ['AC', '←', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  const handlePress = (label: string) => {
    if (/\d/.test(label)) {
      onAction('NUMBER', label);
    } else if (['+', '-', '×', '÷'].includes(label)) {
      onAction('OPERATOR', label);
    } else if (label === '=') {
      onAction('EQUALS');
    } else if (label === 'AC') {
      onAction('CLEAR');
    } else if (label === '←') {
      onAction('BACKSPACE');
    } else if (label === '.') {
      onAction('DECIMAL');
    }
  };

  const getButtonStyle = (label: string) => {
    if (['+', '-', '×', '÷', '='].includes(label)) {
      return [styles.button, styles.operator];
    }
    if (label === 'AC' || label === '←') {
      return [styles.button, styles.function];
    }
    return styles.button;
  };

  return (
    <View style={styles.container}>
      {buttons.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((label) => (
            <TouchableOpacity
              key={label}
              style={getButtonStyle(label)}
              onPress={() => handlePress(label)}
            >
              <Text style={styles.text}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  button: {
    width: 70,
    height: 70,
    backgroundColor: '#505050',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  operator: {
    backgroundColor: '#FF9500',
  },
  function: {
    backgroundColor: '#A5A5A5',
  },
  text: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

**Improvements:**
- ✅ Combined Button and ButtonGrid (no need for separation)
- ✅ Single `onAction` callback instead of 14 separate props
- ✅ Inline button rendering (no separate component)
- ✅ Simple button layout array
- ✅ 120 lines instead of 299 lines

---

## Side-by-Side Comparison

### Before: Current Structure (2,136 lines)

```
app/(tabs)/index.tsx                     354 lines
  ├─ useCalculator hook                  294 lines
  ├─ useUndoRedo hook                    165 lines
  └─ useSounds hook                      123 lines
components/calculator/
  ├─ Display.tsx                          99 lines
  ├─ ButtonGrid.tsx                      145 lines
  ├─ Button.tsx                          154 lines
  ├─ ReceiptTape.tsx                     174 lines
  ├─ HistoryItem.tsx                      92 lines
  ├─ ErrorModal.tsx                      167 lines
  ├─ UndoRedoIndicator.tsx                95 lines
  └─ ModeSwitch.tsx                      186 lines
utils/calculator.ts                      159 lines
utils/storage.ts                         159 lines

Total: ~2,136 lines
```

### After: Simplified Structure (~660 lines)

```
app/(tabs)/index.tsx                     200 lines
  └─ Simple state, no custom hooks
components/calculator/
  ├─ CalculatorDisplay.tsx                60 lines
  ├─ CalculatorHistory.tsx                80 lines
  └─ CalculatorButtons.tsx               120 lines
utils/
  ├─ calculator.ts (pure functions)       60 lines
  └─ storage.ts                          100 lines
types/calculator.ts                       40 lines

Total: ~660 lines (69% reduction!)
```

---

## Three Views: Separation of Concerns

### 1. **Display View** (CalculatorDisplay.tsx)

**Responsibilities:**
- ✅ Show current value
- ✅ Show mode indicator
- ✅ Show error messages

**Props:**
```typescript
interface DisplayProps {
  value: string;
  mode: 'checkbook' | 'scientific';
  error?: string;
}
```

**No logic, just presentation.**

---

### 2. **History View** (CalculatorHistory.tsx)

**Responsibilities:**
- ✅ Display list of calculations
- ✅ Handle empty state
- ✅ Emit selection event

**Props:**
```typescript
interface HistoryProps {
  history: CalculationHistory[];
  onSelectItem: (item: CalculationHistory) => void;
}
```

**Self-contained, manages own scrolling.**

---

### 3. **Buttons View** (CalculatorButtons.tsx)

**Responsibilities:**
- ✅ Render button grid
- ✅ Route button presses to single handler
- ✅ Style buttons by type

**Props:**
```typescript
interface ButtonsProps {
  onAction: (type: string, value?: string) => void;
}
```

**All button logic in one place, single callback.**

---

## Migration Strategy

### Phase 1: Inline useCalculator hook
1. Move calculator state directly into index.tsx
2. Remove useCallback wrappers
3. Simplify to single handler function

**Est. reduction: 294 lines → 80 lines**

### Phase 2: Combine Button components
1. Merge Button.tsx into ButtonGrid.tsx
2. Replace 14 props with single `onAction` callback
3. Inline button rendering

**Est. reduction: 299 lines → 120 lines**

### Phase 3: Simplify Display
1. Remove memoization
2. Remove dynamic sizing (use responsive styles)
3. Simplify props

**Est. reduction: 99 lines → 60 lines**

### Phase 4: Simplify History
1. Remove useCallback memoization
2. Inline HistoryItem rendering
3. Fixed height instead of dynamic

**Est. reduction: 266 lines → 80 lines**

### Phase 5: Simplify utilities
1. Remove CalculatorEngine class
2. Use plain functions
3. Remove over-abstraction

**Est. reduction: 159 lines → 60 lines**

---

## Final Recommendations

### ✅ Do This:
1. **Start with Phase 1** (inline useCalculator) - biggest win
2. **Remove all useCallback** unless you measure a performance problem
3. **Combine related files** (Button + ButtonGrid, HistoryItem + ReceiptTape)
4. **Use single event handlers** (onAction instead of onNumberPress, onDecimalPress, etc.)
5. **Keep it simple** - you're building a calculator, not a framework

### ❌ Don't Do This:
1. Don't memoize unless you have a proven performance issue
2. Don't create custom hooks for simple state
3. Don't split components into tiny files (Button.tsx for a 154-line button!)
4. Don't use refs to track state (fighting React)
5. Don't wrap callbacks in more callbacks

---

## Summary

**Current:** 2,136 lines across 15 files
**Simplified:** ~660 lines across 6 files
**Reduction:** 69% less code

**Three views perfectly separated:**
- **Display:** Pure presentation (60 lines)
- **History:** Self-contained list (80 lines)
- **Buttons:** Single responsibility grid (120 lines)

**All controlled by simple main screen (200 lines) with:**
- Plain state (no custom hooks)
- Single event handler
- Clear data flow

**This is how React was meant to be used - simple and readable.**
