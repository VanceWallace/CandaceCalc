/**
 * Unit tests for useUndoRedo hook
 * Tests undo/redo state management and stack operations
 */

import { renderHook, act } from '@testing-library/react-native';
import { useUndoRedo } from '@/hooks/calculator/useUndoRedo';
import { CalculatorState } from '@/types/calculator';

const INITIAL_STATE: CalculatorState = {
  display: '0',
  expression: '',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  error: false,
  errorMessage: '',
};

describe('useUndoRedo', () => {
  describe('initialization', () => {
    test('should initialize with initial state', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(false);
      expect(result.current.feedback).toBeNull();
    });
  });

  describe('pushState', () => {
    test('should add new state to stack', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      const newState = { ...INITIAL_STATE, display: '5' };

      act(() => {
        result.current.pushState(newState);
      });

      expect(result.current.canUndo()).toBe(true);
      expect(result.current.canRedo()).toBe(false);
    });

    test('should add multiple states to stack', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      act(() => {
        result.current.pushState({ ...INITIAL_STATE, display: '5' });
        result.current.pushState({ ...INITIAL_STATE, display: '50' });
        result.current.pushState({ ...INITIAL_STATE, display: '500' });
      });

      expect(result.current.canUndo()).toBe(true);
    });

    test('should clear redo stack when new state is pushed', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      act(() => {
        result.current.pushState({ ...INITIAL_STATE, display: '5' });
        result.current.pushState({ ...INITIAL_STATE, display: '50' });
      });

      // Undo once
      act(() => {
        result.current.undo(() => {});
      });

      expect(result.current.canRedo()).toBe(true);

      // Push new state - should clear redo stack
      act(() => {
        result.current.pushState({ ...INITIAL_STATE, display: '7' });
      });

      expect(result.current.canRedo()).toBe(false);
    });

    test('should limit stack to UNDO_REDO_STACK_SIZE', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      // Push 25 states (limit is 20)
      act(() => {
        for (let i = 0; i < 25; i++) {
          result.current.pushState({ ...INITIAL_STATE, display: i.toString() });
        }
      });

      // Count how many times we can undo
      let undoCount = 0;
      act(() => {
        while (result.current.canUndo()) {
          result.current.undo(() => {});
          undoCount++;
        }
      });

      // Should be able to undo maximum 20 times (UNDO_REDO_STACK_SIZE)
      expect(undoCount).toBeLessThanOrEqual(20);
    });
  });

  describe('undo', () => {
    test('should undo to previous state', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      const state1 = { ...INITIAL_STATE, display: '5' };
      act(() => {
        result.current.pushState(state1);
      });

      let restoredState: CalculatorState | null = null;
      act(() => {
        result.current.undo((state) => {
          restoredState = state;
        });
      });

      expect(restoredState).toEqual(INITIAL_STATE);
      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(true);
    });

    test('should undo multiple states', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      const state1 = { ...INITIAL_STATE, display: '5' };
      const state2 = { ...INITIAL_STATE, display: '50' };

      act(() => {
        result.current.pushState(state1);
        result.current.pushState(state2);
      });

      let restoredState: CalculatorState | null = null;

      // First undo
      act(() => {
        result.current.undo((state) => {
          restoredState = state;
        });
      });
      expect(restoredState).toEqual(state1);

      // Second undo
      act(() => {
        result.current.undo((state) => {
          restoredState = state;
        });
      });
      expect(restoredState).toEqual(INITIAL_STATE);
    });

    test('should not undo when at beginning of stack', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      expect(result.current.canUndo()).toBe(false);

      let called = false;
      act(() => {
        result.current.undo(() => {
          called = true;
        });
      });

      // Callback should not be called when can't undo
      expect(called).toBe(false);
    });

    test('should set feedback message on undo', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      act(() => {
        result.current.pushState({ ...INITIAL_STATE, display: '5' });
      });

      act(() => {
        result.current.undo(() => {});
      });

      expect(result.current.feedback).not.toBeNull();
      expect(result.current.feedback?.message).toContain('↶');
      expect(result.current.feedback?.isUndo).toBe(true);
    });

    test('should describe operation in feedback message', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      const stateWithOperation = {
        ...INITIAL_STATE,
        display: '10',
        operation: '+' as const,
        previousValue: 5,
      };

      act(() => {
        result.current.pushState(stateWithOperation);
      });

      act(() => {
        result.current.undo(() => {});
      });

      expect(result.current.feedback?.message).toContain('added');
    });
  });

  describe('redo', () => {
    test('should redo to next state', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      const state1 = { ...INITIAL_STATE, display: '5' };

      act(() => {
        result.current.pushState(state1);
      });

      // Undo first
      act(() => {
        result.current.undo(() => {});
      });

      expect(result.current.canRedo()).toBe(true);

      // Now redo
      let restoredState: CalculatorState | null = null;
      act(() => {
        result.current.redo((state) => {
          restoredState = state;
        });
      });

      expect(restoredState).toEqual(state1);
      expect(result.current.canRedo()).toBe(false);
    });

    test('should redo multiple states', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      const state1 = { ...INITIAL_STATE, display: '5' };
      const state2 = { ...INITIAL_STATE, display: '50' };

      act(() => {
        result.current.pushState(state1);
        result.current.pushState(state2);
      });

      // Undo twice
      act(() => {
        result.current.undo(() => {});
        result.current.undo(() => {});
      });

      let restoredState: CalculatorState | null = null;

      // Redo first
      act(() => {
        result.current.redo((state) => {
          restoredState = state;
        });
      });
      expect(restoredState).toEqual(state1);

      // Redo second
      act(() => {
        result.current.redo((state) => {
          restoredState = state;
        });
      });
      expect(restoredState).toEqual(state2);
    });

    test('should not redo when at end of stack', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      expect(result.current.canRedo()).toBe(false);

      let called = false;
      act(() => {
        result.current.redo(() => {
          called = true;
        });
      });

      // Callback should not be called when can't redo
      expect(called).toBe(false);
    });

    test('should set feedback message on redo', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      act(() => {
        result.current.pushState({ ...INITIAL_STATE, display: '5' });
        result.current.undo(() => {});
        result.current.redo(() => {});
      });

      expect(result.current.feedback).not.toBeNull();
      expect(result.current.feedback?.message).toContain('↷');
      expect(result.current.feedback?.isUndo).toBe(false);
    });
  });

  describe('canUndo and canRedo', () => {
    test('canUndo should return false initially', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      expect(result.current.canUndo()).toBe(false);
    });

    test('canUndo should return true after pushState', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      act(() => {
        result.current.pushState({ ...INITIAL_STATE, display: '5' });
      });

      expect(result.current.canUndo()).toBe(true);
    });

    test('canRedo should return false initially', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      expect(result.current.canRedo()).toBe(false);
    });

    test('canRedo should return true after undo', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      act(() => {
        result.current.pushState({ ...INITIAL_STATE, display: '5' });
        result.current.undo(() => {});
      });

      expect(result.current.canRedo()).toBe(true);
    });
  });

  describe('clear', () => {
    test('should clear all undo/redo history', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      act(() => {
        result.current.pushState({ ...INITIAL_STATE, display: '5' });
        result.current.pushState({ ...INITIAL_STATE, display: '50' });
      });

      expect(result.current.canUndo()).toBe(true);

      const newInitialState = { ...INITIAL_STATE, display: '1' };
      act(() => {
        result.current.clear(newInitialState);
      });

      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(false);
      expect(result.current.feedback).toBeNull();
    });
  });

  describe('clearFeedback', () => {
    test('should clear feedback message', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      act(() => {
        result.current.pushState({ ...INITIAL_STATE, display: '5' });
        result.current.undo(() => {});
      });

      expect(result.current.feedback).not.toBeNull();

      act(() => {
        result.current.clearFeedback();
      });

      expect(result.current.feedback).toBeNull();
    });
  });

  describe('complex undo/redo scenarios', () => {
    test('should handle undo, redo, then push new state', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      act(() => {
        result.current.pushState({ ...INITIAL_STATE, display: '5' });
        result.current.pushState({ ...INITIAL_STATE, display: '50' });
        result.current.undo(() => {});
        result.current.redo(() => {});
        result.current.pushState({ ...INITIAL_STATE, display: '7' });
      });

      expect(result.current.canUndo()).toBe(true);
      expect(result.current.canRedo()).toBe(false);
    });

    test('should maintain correct state after multiple undo/redo operations', () => {
      const { result } = renderHook(() => useUndoRedo(INITIAL_STATE));

      const states = [
        { ...INITIAL_STATE, display: '1' },
        { ...INITIAL_STATE, display: '2' },
        { ...INITIAL_STATE, display: '3' },
      ];

      // Push all states
      act(() => {
        states.forEach(state => result.current.pushState(state));
      });

      let restoredState: CalculatorState | null = null;

      // Undo twice
      act(() => {
        result.current.undo(() => {});
        result.current.undo((state) => {
          restoredState = state;
        });
      });

      expect(restoredState?.display).toBe('1');

      // Redo once
      act(() => {
        result.current.redo((state) => {
          restoredState = state;
        });
      });

      expect(restoredState?.display).toBe('2');
    });
  });
});
