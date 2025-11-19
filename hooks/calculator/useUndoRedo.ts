/**
 * Undo/Redo functionality hook
 * Maintains history of calculator states for undo/redo operations
 */

import { useState, useCallback } from 'react';
import { CalculatorState } from '@/types/calculator';
import { UNDO_REDO_STACK_SIZE } from '@/constants/calculator';

interface UndoRedoState {
  stack: CalculatorState[];
  currentIndex: number;
}

export function useUndoRedo(initialState: CalculatorState) {
  const [undoRedo, setUndoRedo] = useState<UndoRedoState>({
    stack: [initialState],
    currentIndex: 0,
  });

  const [feedback, setFeedback] = useState<{
    message: string;
    isUndo: boolean;
  } | null>(null);

  /**
   * Push new state to history (clears redo stack)
   */
  const pushState = useCallback((newState: CalculatorState) => {
    setUndoRedo((prev) => {
      // Remove all states after current index (redo stack)
      const newStack = prev.stack.slice(0, prev.currentIndex + 1);

      // Add new state
      newStack.push(newState);

      // Limit stack size
      if (newStack.length > UNDO_REDO_STACK_SIZE) {
        newStack.shift();
        return {
          stack: newStack,
          currentIndex: UNDO_REDO_STACK_SIZE - 1,
        };
      }

      return {
        stack: newStack,
        currentIndex: newStack.length - 1,
      };
    });
  }, []);

  /**
   * Undo to previous state
   */
  const undo = useCallback(
    (onStateChange: (state: CalculatorState) => void): boolean => {
      setUndoRedo((prev) => {
        if (prev.currentIndex <= 0) {
          return prev; // Can't undo further
        }

        const newIndex = prev.currentIndex - 1;
        const previousState = prev.stack[newIndex];

        // Format feedback message
        const operation = previousState.operation || 'value';
        const operationText = operation === '+' ? 'added' :
                            operation === '-' ? 'subtracted' :
                            operation === '×' ? 'multiplied by' :
                            operation === '÷' ? 'divided by' :
                            'changed to';

        setFeedback({
          message: `⟲ Undid last operation${previousState.operation ? ': ' + operationText : ''}`,
          isUndo: true,
        });

        onStateChange(previousState);

        return {
          ...prev,
          currentIndex: newIndex,
        };
      });

      return true;
    },
    []
  );

  /**
   * Redo to next state
   */
  const redo = useCallback(
    (onStateChange: (state: CalculatorState) => void): boolean => {
      setUndoRedo((prev) => {
        if (prev.currentIndex >= prev.stack.length - 1) {
          return prev; // Can't redo further
        }

        const newIndex = prev.currentIndex + 1;
        const nextState = prev.stack[newIndex];

        setFeedback({
          message: `⟳ Redid operation`,
          isUndo: false,
        });

        onStateChange(nextState);

        return {
          ...prev,
          currentIndex: newIndex,
        };
      });

      return true;
    },
    []
  );

  /**
   * Check if undo is possible
   */
  const canUndo = useCallback((): boolean => {
    return undoRedo.currentIndex > 0;
  }, [undoRedo.currentIndex]);

  /**
   * Check if redo is possible
   */
  const canRedo = useCallback((): boolean => {
    return undoRedo.currentIndex < undoRedo.stack.length - 1;
  }, [undoRedo.currentIndex, undoRedo.stack.length]);

  /**
   * Clear all undo/redo history
   */
  const clear = useCallback((initialState: CalculatorState) => {
    setUndoRedo({
      stack: [initialState],
      currentIndex: 0,
    });
    setFeedback(null);
  }, []);

  /**
   * Clear feedback message
   */
  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    feedback,
    clearFeedback,
  };
}
