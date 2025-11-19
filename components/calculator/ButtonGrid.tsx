/**
 * Calculator button grid component
 * Displays buttons in a responsive grid layout with inline button rendering
 * Phase 2 Simplification: Button component inlined to reduce file count and complexity
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ViewStyle,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { RetroColors } from '@/constants/Colors';
import {
  CHECKBOOK_LAYOUT,
  BUTTON_GAP,
  BUTTON_SIZE,
  BUTTON_TYPES,
  BUTTON_CATEGORIES,
} from '@/constants/calculator';
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
  onNegativeToggle: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

/**
 * Individual calculator button component (inlined)
 */
const CalcButton: React.FC<{
  label: string;
  onPress: () => void;
  disabled?: boolean;
}> = ({ label, onPress, disabled = false }) => {
  const [pressed, setPressed] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  // Calculate responsive button size
  const responsiveButtonSize = Math.max(
    Math.min(screenWidth * 0.18, BUTTON_SIZE),
    50 // minimum 50px
  );

  // Determine button type for styling
  const buttonType =
    BUTTON_CATEGORIES[label as keyof typeof BUTTON_CATEGORIES] ||
    BUTTON_TYPES.NUMBER;

  // Get colors based on button type
  const getButtonColors = () => {
    switch (buttonType) {
      case BUTTON_TYPES.NUMBER:
        return {
          backgroundColor: RetroColors.buttonBeige,
          textColor: RetroColors.textDark,
          shadowDark: '#6B6B6B',
          shadowLight: '#FFFFFF',
        };
      case BUTTON_TYPES.OPERATOR:
        return {
          backgroundColor: RetroColors.buttonBrown,
          textColor: RetroColors.textLight,
          shadowDark: '#3D2817',
          shadowLight: '#D4C5B9',
        };
      case BUTTON_TYPES.EQUALS:
        return {
          backgroundColor: RetroColors.buttonOrange,
          textColor: RetroColors.textLight,
          shadowDark: '#CC5500',
          shadowLight: '#FFB84D',
        };
      case BUTTON_TYPES.CONTROL:
      case BUTTON_TYPES.UNDO_REDO:
        return {
          backgroundColor: RetroColors.buttonRed,
          textColor: RetroColors.textLight,
          shadowDark: '#8B3A3A',
          shadowLight: '#FF9999',
        };
      case BUTTON_TYPES.MEMORY:
        return {
          backgroundColor: RetroColors.buttonGray,
          textColor: RetroColors.textDark,
          shadowDark: '#6B6B6B',
          shadowLight: '#FFFFFF',
        };
      case BUTTON_TYPES.FUNCTION:
        return {
          backgroundColor: RetroColors.buttonBeigeHover,
          textColor: RetroColors.textDark,
          shadowDark: '#6B6B6B',
          shadowLight: '#FFFFFF',
        };
      default:
        return {
          backgroundColor: RetroColors.buttonBeige,
          textColor: RetroColors.textDark,
          shadowDark: '#6B6B6B',
          shadowLight: '#FFFFFF',
        };
    }
  };

  const colors = getButtonColors();

  const containerStyle: ViewStyle = {
    width: responsiveButtonSize,
    height: responsiveButtonSize,
    marginRight: BUTTON_GAP / 2,
    marginLeft: BUTTON_GAP / 2,
    marginBottom: BUTTON_GAP,
  };

  const buttonStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: pressed ? 2 : 3,
    borderTopColor: pressed ? colors.shadowDark : colors.shadowLight,
    borderLeftColor: pressed ? colors.shadowDark : colors.shadowLight,
    borderBottomColor: pressed ? colors.shadowLight : colors.shadowDark,
    borderRightColor: pressed ? colors.shadowLight : colors.shadowDark,
    ...Platform.select({
      web: {
        boxShadow: pressed
          ? '1px 1px 1px rgba(0, 0, 0, 0.2)'
          : '2px 2px 3px rgba(0, 0, 0, 0.4)',
      },
      default: {
        elevation: pressed ? 0 : 4,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: pressed ? 0.2 : 0.4,
        shadowRadius: pressed ? 1 : 3,
      },
    }),
    transform: [{ translateY: pressed ? 2 : 0 }],
  };

  const textStyle = {
    color: colors.textColor,
    fontSize: Math.max(responsiveButtonSize * 0.4, 16),
    fontWeight: 'bold' as const,
    fontFamily: 'monospace',
  };

  return (
    <View style={containerStyle}>
      <Pressable
        style={buttonStyle}
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        disabled={disabled}
        android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
      >
        <Text style={textStyle} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
};

/**
 * Button grid container
 */
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
  onNegativeToggle,
  canUndo = false,
  canRedo = false,
}) => {
  const buttonLayout = CHECKBOOK_LAYOUT;

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
        case '+/-':
        case '±':
          onNegativeToggle();
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
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
      marginBottom: BUTTON_GAP,
    },
    buttonWrapper: {
      // Empty wrapper for spacing
    },
  });

  return (
    <View style={styles.container}>
      {buttonLayout.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((label, colIndex) => {
            // Skip empty button placeholders
            if (label === '') {
              return (
                <View
                  key={`empty-${rowIndex}-${colIndex}`}
                  style={styles.buttonWrapper}
                />
              );
            }
            return (
              <CalcButton
                key={`button-${label}-${rowIndex}`}
                label={label}
                onPress={() => handleButtonPress(label)}
                disabled={
                  (label === '⟲' && !canUndo) || (label === '⟳' && !canRedo)
                }
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default ButtonGrid;
