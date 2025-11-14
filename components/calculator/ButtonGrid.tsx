/**
 * Calculator button grid component
 * Displays buttons in a responsive grid layout
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { CHECKBOOK_LAYOUT, SCIENTIFIC_LAYOUT, BUTTON_GAP } from '@/constants/calculator';
import { CalculatorMode } from '@/types/calculator';

interface ButtonGridProps {
  mode: CalculatorMode;
  onNumberPress: (digit: string) => void;
  onDecimalPress: () => void;
  onOperatorPress: (op: string) => void;
  onEqualsPress: () => void;
  onClear: () => void;
  onAllClear: () => void;
  onBackspace: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onMemoryAdd?: () => void;
  onMemorySubtract?: () => void;
  onMemoryRecall?: () => void;
  onNegativeToggle: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

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
  const buttonLayout = mode === 'checkbook' ? CHECKBOOK_LAYOUT : SCIENTIFIC_LAYOUT;

  const handleButtonPress = (label: string) => {
    const numValue = parseInt(label);
    if (!isNaN(numValue)) {
      onNumberPress(label);
    } else {
      switch (label) {
        case '.':
          onDecimalPress();
          break;
        case '+':
        case '-':
        case '×':
        case '÷':
          onOperatorPress(label);
          break;
        case '=':
          onEqualsPress();
          break;
        case 'C':
          onClear();
          break;
        case 'AC':
          onAllClear();
          break;
        case '←':
          onBackspace();
          break;
        case '↶':
          if (canUndo) onUndo();
          break;
        case '↷':
          if (canRedo) onRedo();
          break;
        case '+/-':
          onNegativeToggle();
          break;
        case 'M+':
          if (onMemoryAdd) onMemoryAdd();
          break;
        case 'M-':
          if (onMemorySubtract) onMemorySubtract();
          break;
        case 'MR':
          if (onMemoryRecall) onMemoryRecall();
          break;
        case '√':
        case '%':
        case 'x²':
        case '(':
        case ')':
          // Scientific functions - can be implemented later
          break;
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 4,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      marginHorizontal: -BUTTON_GAP / 2,
    },
    buttonWrapper: {
      flex: 0,
    },
  });

  return (
    <View style={styles.container}>
      {buttonLayout.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((label) => (
            <View key={`button-${label}-${rowIndex}`} style={styles.buttonWrapper}>
              <Button
                label={label}
                onPress={() => handleButtonPress(label)}
                disabled={
                  (label === '↶' && !canUndo) ||
                  (label === '↷' && !canRedo)
                }
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default ButtonGrid;
