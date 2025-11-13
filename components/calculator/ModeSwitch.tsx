/**
 * Mode switch informational modal
 * Warns users about decimal precision changes when switching modes
 */

import React, { useEffect } from 'react';
import { StyleSheet, Modal, View, Text, Pressable, Dimensions } from 'react-native';
import { RetroColors } from '@/constants/Colors';
import { MODE_SWITCH_TIMEOUT } from '@/constants/calculator';
import { CalculatorMode } from '@/types/calculator';

interface ModeSwitchProps {
  visible: boolean;
  newMode: CalculatorMode;
  onDismiss: () => void;
}

export const ModeSwitch: React.FC<ModeSwitchProps> = ({
  visible,
  newMode,
  onDismiss,
}) => {
  const windowHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (visible) {
      // Auto-dismiss after timeout
      const timer = setTimeout(() => {
        onDismiss();
      }, MODE_SWITCH_TIMEOUT);

      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  const getModeInfo = () => {
    if (newMode === 'checkbook') {
      return {
        emoji: '💰',
        title: 'Switched to Checkbook Mode',
        description:
          'Numbers will be rounded to 2 decimal places (US cents: $0.00)',
        example: 'Example: 1.234 becomes 1.23',
      };
    } else {
      return {
        emoji: '🔬',
        title: 'Switched to Scientific Mode',
        description:
          'Numbers will show up to 8 decimal places for precise calculations.',
        example: 'Example: 1.234567891234 becomes 1.23456789',
      };
    }
  };

  const modeInfo = getModeInfo();

  const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
      margin: 20,
      backgroundColor: RetroColors.casingBeige,
      borderRadius: 8,
      paddingHorizontal: 24,
      paddingVertical: 32,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      borderWidth: 3,
      borderColor: RetroColors.casingBrown,
      maxHeight: windowHeight * 0.7,
    },
    emoji: {
      fontSize: 48,
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: RetroColors.textDark,
      marginBottom: 12,
      textAlign: 'center',
      fontFamily: 'monospace',
    },
    description: {
      fontSize: 14,
      color: RetroColors.textGray,
      marginBottom: 16,
      textAlign: 'center',
      lineHeight: 20,
    },
    exampleContainer: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      borderRadius: 4,
      padding: 12,
      marginBottom: 24,
      borderLeftWidth: 4,
      borderLeftColor: RetroColors.casingBrown,
    },
    exampleLabel: {
      fontSize: 11,
      color: RetroColors.textGray,
      fontWeight: 'bold',
      marginBottom: 4,
      fontFamily: 'monospace',
    },
    exampleText: {
      fontSize: 12,
      color: RetroColors.textDark,
      fontFamily: 'monospace',
    },
    button: {
      backgroundColor: RetroColors.buttonOrange,
      borderRadius: 6,
      paddingVertical: 12,
      paddingHorizontal: 28,
      borderWidth: 3,
      borderTopColor: RetroColors.shadowLight,
      borderLeftColor: RetroColors.shadowLight,
      borderBottomColor: RetroColors.shadowDark,
      borderRightColor: RetroColors.shadowDark,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    buttonText: {
      color: RetroColors.textLight,
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'monospace',
    },
    timerText: {
      fontSize: 11,
      color: RetroColors.textGray,
      marginTop: 16,
      fontStyle: 'italic',
      fontFamily: 'monospace',
    },
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.emoji}>{modeInfo.emoji}</Text>
          <Text style={styles.title}>{modeInfo.title}</Text>
          <Text style={styles.description}>{modeInfo.description}</Text>

          <View style={styles.exampleContainer}>
            <Text style={styles.exampleLabel}>EXAMPLE:</Text>
            <Text style={styles.exampleText}>{modeInfo.example}</Text>
          </View>

          <Pressable style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>OK - I UNDERSTAND</Text>
          </Pressable>

          <Text style={styles.timerText}>
            This message will close automatically in {MODE_SWITCH_TIMEOUT / 1000} seconds.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default ModeSwitch;
