/**
 * LCD-style display component
 * Shows current calculation and error messages
 */

import React, { useMemo } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { RetroColors, AmberLcdPalette, GreenLcdPalette } from '@/constants/Colors';
import { LcdColor, CalculatorMode } from '@/types/calculator';

interface DisplayProps {
  value: string;
  expression?: string;
  error: boolean;
  errorMessage: string;
  lcdColor?: LcdColor;
  mode?: CalculatorMode;
  currencySymbol?: string;
}

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

  // Show expression if available, otherwise show value
  const displayContent = expression || value;

  // Calculate font size based on screen width and content length
  const baseFontSize = Math.min(screenWidth * 0.1, 48);
  const dynamicFontSize = Math.max(baseFontSize - (displayContent.length > 15 ? 15 : 0), 24);

  const lcdPalette = lcdColor === 'amber' ? AmberLcdPalette : GreenLcdPalette;

  const displayText = error ? errorMessage : displayContent;

  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => ({
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
    } as const,
    displayText: {
      color: error ? RetroColors.errorRed : lcdPalette.display,
      fontSize: dynamicFontSize,
      fontFamily: 'monospace',
      textAlign: 'right' as const,
      fontWeight: '500' as const,
      textShadowColor: error ? 'transparent' : lcdPalette.glow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: error ? 0 : 8,
      letterSpacing: 1,
    } as const,
    modeLabel: {
      color: lcdPalette.display,
      fontSize: 10,
      fontFamily: 'monospace',
      marginTop: 4,
      opacity: 0.6,
    } as const,
  }), [lcdPalette, dynamicFontSize, error]);

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
