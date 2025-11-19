/**
 * Calculator button grid component
 * Displays buttons in a responsive grid layout
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { CHECKBOOK_LAYOUT, BUTTON_GAP } from '@/constants/calculator';
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
  canUndo = false,
  canRedo = false,
}) => {
  const buttonLayout = CHECKBOOK_LAYOUT; // Only checkbook mode now

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
        case '⟲':
          if (canUndo) onUndo();
          break;
        case '⟳':
          if (canRedo) onRedo();
          break;
        default:
          // Ignore empty buttons or unhandled cases
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
      flexWrap: 'nowrap',  // Changed from 'wrap' to prevent Android reflow issues
      justifyContent: 'space-between',  // Better distribution across all platforms
      marginBottom: BUTTON_GAP,
    },
    buttonWrapper: {
      // Removed flex: 0 which was collapsing buttons on web
      // Button component handles its own sizing internally
    },
  });

  return (
    <View style={styles.container}>
      {buttonLayout.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((label, colIndex) => {
            // Skip empty button placeholders
            if (label === '') {
              return <View key={`empty-${rowIndex}-${colIndex}`} style={styles.buttonWrapper} />;
            }
            return (
              <View key={`button-${label}-${rowIndex}`} style={styles.buttonWrapper}>
                <Button
                  label={label}
                  onPress={() => handleButtonPress(label)}
                  disabled={
                    (label === '⟲' && !canUndo) ||
                    (label === '⟳' && !canRedo)
                  }
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default ButtonGrid;
