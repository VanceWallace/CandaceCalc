/**
 * Undo/Redo feedback indicator
 * Shows visual feedback when user performs undo/redo operations
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { RetroColors } from '@/constants/Colors';
import { UNDO_REDO_TIMEOUT } from '@/constants/calculator';

interface UndoRedoIndicatorProps {
  visible: boolean;
  message: string;
  isUndo: boolean;
  onDismiss: () => void;
}

export const UndoRedoIndicator: React.FC<UndoRedoIndicatorProps> = ({
  visible,
  message,
  isUndo,
  onDismiss,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Auto-dismiss after timeout
      const timer = setTimeout(() => {
        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onDismiss();
        });
      }, UNDO_REDO_TIMEOUT);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, onDismiss]);

  if (!visible) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: isUndo ? RetroColors.buttonOrange : RetroColors.buttonBrown,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: RetroColors.casingDark,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
    },
    text: {
      color: RetroColors.textLight,
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'monospace',
    },
    subtext: {
      color: RetroColors.textLight,
      fontSize: 12,
      marginTop: 4,
      opacity: 0.85,
      fontFamily: 'monospace',
    },
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.text}>{message}</Text>
      <Text style={styles.subtext}>
        This will close in {UNDO_REDO_TIMEOUT / 1000} seconds
      </Text>
    </Animated.View>
  );
};

export default UndoRedoIndicator;
