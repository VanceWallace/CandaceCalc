/**
 * Error modal component
 * Displays user-friendly error messages with action buttons
 */

import React, { useEffect } from 'react';
import { StyleSheet, Modal, View, Text, Pressable, Dimensions } from 'react-native';
import { RetroColors } from '@/constants/Colors';
import { ERROR_MESSAGE_TIMEOUT } from '@/constants/calculator';

interface ErrorModalProps {
  visible: boolean;
  errorMessage: string;
  onDismiss: () => void;
  onUndo?: () => void;
  showUndoButton?: boolean;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  errorMessage,
  onDismiss,
  onUndo,
  showUndoButton = true,
}) => {
  const windowHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (visible) {
      // Auto-dismiss after timeout
      const timer = setTimeout(() => {
        onDismiss();
      }, ERROR_MESSAGE_TIMEOUT);

      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  // Extract error type emoji and format message
  const getErrorEmoji = () => {
    if (errorMessage.includes('divide')) return '⚠️';
    if (errorMessage.includes('large')) return '🚫';
    return 'ℹ️';
  };

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
    errorText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: RetroColors.textDark,
      marginBottom: 16,
      textAlign: 'center',
      fontFamily: 'monospace',
    },
    messageText: {
      fontSize: 14,
      color: RetroColors.textGray,
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
    },
    button: {
      backgroundColor: RetroColors.buttonRed,
      borderRadius: 6,
      paddingVertical: 14,
      paddingHorizontal: 24,
      minWidth: 100,
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
    undoButton: {
      backgroundColor: RetroColors.buttonOrange,
    },
    buttonText: {
      color: RetroColors.textLight,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'monospace',
    },
    timerText: {
      fontSize: 12,
      color: RetroColors.textGray,
      marginTop: 12,
      fontStyle: 'italic',
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
          <Text style={styles.emoji}>{getErrorEmoji()}</Text>
          <Text style={styles.errorText}>Error</Text>
          <Text style={styles.messageText}>{errorMessage}</Text>

          <View style={styles.buttonContainer}>
            {showUndoButton && onUndo && (
              <Pressable
                style={[styles.button, styles.undoButton]}
                onPress={onUndo}
              >
                <Text style={styles.buttonText}>UNDO</Text>
              </Pressable>
            )}
            <Pressable style={styles.button} onPress={onDismiss}>
              <Text style={styles.buttonText}>OK</Text>
            </Pressable>
          </View>

          <Text style={styles.timerText}>
            This message will close automatically in {ERROR_MESSAGE_TIMEOUT / 1000} seconds.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default ErrorModal;
