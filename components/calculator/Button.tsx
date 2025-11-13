/**
 * Retro 3D calculator button component
 * Features 1980s styling with raised/pressed effects
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ViewStyle,
  Pressable,
} from 'react-native';
import { RetroColors } from '@/constants/Colors';
import { BUTTON_SIZE, BUTTON_GAP } from '@/constants/calculator';
import { BUTTON_TYPES, BUTTON_CATEGORIES } from '@/constants/calculator';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  type?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  disabled = false,
  type,
}) => {
  const [pressed, setPressed] = useState(false);

  // Determine button category
  const buttonType = type || BUTTON_CATEGORIES[label as keyof typeof BUTTON_CATEGORIES] || BUTTON_TYPES.NUMBER;

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

  const styles = StyleSheet.create({
    buttonContainer: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      marginRight: BUTTON_GAP / 2,
      marginLeft: BUTTON_GAP / 2,
      marginBottom: BUTTON_GAP,
    } as ViewStyle,
    button: {
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
      elevation: pressed ? 0 : 4,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: pressed ? 0.2 : 0.4,
      shadowRadius: pressed ? 1 : 3,
      transform: [{ translateY: pressed ? 2 : 0 }],
    } as ViewStyle,
    buttonText: {
      color: colors.textColor,
      fontSize: Math.max(BUTTON_SIZE * 0.4, 20),
      fontWeight: 'bold',
      fontFamily: 'monospace',
    },
  });

  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={styles.button}
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        disabled={disabled}
        android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
      >
        <Text style={styles.buttonText} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
};

export default Button;
