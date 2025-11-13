/**
 * LCD-style display component
 * Shows current calculation and error messages
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { RetroColors, AmberLcdPalette, GreenLcdPalette } from '@/constants/Colors';
import { LcdColor, CalculatorMode } from '@/types/calculator';

interface DisplayProps {
  value: string;
  error: boolean;
  errorMessage: string;
  lcdColor?: LcdColor;
  mode?: CalculatorMode;
  currencySymbol?: string;
}

export const Display: React.FC<DisplayProps> = ({
  value,
  error,
  errorMessage,
  lcdColor = 'amber',
  mode = 'checkbook',
  currencySymbol = '$',
}) => {
  const screenWidth = Dimensions.get('window').width;

  // Calculate font size based on screen width and value length
  const baseFontSize = Math.min(screenWidth * 0.12, 60);
  const dynamicFontSize = Math.max(baseFontSize - (value.length > 10 ? 20 : 0), 32);

  const lcdPalette = lcdColor === 'amber' ? AmberLcdPalette : GreenLcdPalette;

  const displayText = error ? errorMessage : value;

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: lcdPalette.background,
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 16,
      borderWidth: 3,
      borderColor: RetroColors.casingBrown,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    displayText: {
      color: error ? RetroColors.errorRed : lcdPalette.display,
      fontSize: dynamicFontSize,
      fontFamily: 'monospace',
      textAlign: 'right',
      fontWeight: '500',
      textShadowColor: error ? 'transparent' : lcdPalette.glow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: error ? 0 : 8,
      letterSpacing: 1,
    },
    modeLabel: {
      color: lcdPalette.display,
      fontSize: 10,
      fontFamily: 'monospace',
      marginTop: 4,
      opacity: 0.6,
    },
  });

  return (
    <View style={styles.container}>
      <Text
        style={styles.displayText}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {displayText}
      </Text>
      {!error && (
        <Text style={styles.modeLabel}>
          {mode === 'checkbook' ? 'CHECKBOOK' : 'SCIENTIFIC'}
        </Text>
      )}
    </View>
  );
};

export default Display;
