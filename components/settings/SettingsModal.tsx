/**
 * Settings modal component
 * Allows users to configure calculator preferences
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Dimensions,
} from 'react-native';
import { RetroColors } from '@/constants/Colors';
import { AppSettings, CalculatorMode, LcdColor } from '@/types/calculator';
import { CURRENCY_SYMBOLS } from '@/constants/calculator';

interface SettingsModalProps {
  visible: boolean;
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  settings,
  onSettingsChange,
  onClose,
}) => {
  const windowHeight = Dimensions.get('window').height;

  const handleModeChange = (mode: CalculatorMode) => {
    onSettingsChange({ ...settings, mode });
  };

  const handleLcdColorChange = (color: LcdColor) => {
    onSettingsChange({ ...settings, lcdColor: color });
  };

  const handleSoundToggle = (soundEnabled: boolean) => {
    onSettingsChange({ ...settings, soundEnabled });
  };

  const handleRetentionChange = (days: 30 | 60 | 90) => {
    onSettingsChange({ ...settings, retentionDays: days });
  };

  const handleShowModeWarningToggle = (show: boolean) => {
    onSettingsChange({ ...settings, showModeWarning: show });
  };

  const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      backgroundColor: RetroColors.casingBeige,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 24,
      paddingBottom: 32,
      maxHeight: windowHeight * 0.9,
      borderTopWidth: 3,
      borderTopColor: RetroColors.casingBrown,
    },
    header: {
      marginBottom: 24,
      alignItems: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: RetroColors.textDark,
      fontFamily: 'monospace',
    },
    closeHint: {
      fontSize: 11,
      color: RetroColors.textGray,
      fontStyle: 'italic',
      marginTop: 4,
    },
    section: {
      marginBottom: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 6,
      borderLeftWidth: 4,
      borderLeftColor: RetroColors.casingBrown,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: RetroColors.textDark,
      fontFamily: 'monospace',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    optionContainer: {
      marginBottom: 10,
    },
    optionLabel: {
      fontSize: 13,
      color: RetroColors.textDark,
      fontFamily: 'monospace',
      marginBottom: 6,
    },
    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    buttonGroup: {
      flexDirection: 'row',
      gap: 8,
    },
    optionButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: RetroColors.casingBrown,
      backgroundColor: RetroColors.buttonBeige,
      alignItems: 'center',
    },
    optionButtonActive: {
      backgroundColor: RetroColors.buttonBrown,
    },
    optionButtonText: {
      fontSize: 11,
      fontFamily: 'monospace',
      fontWeight: 'bold',
      color: RetroColors.textDark,
    },
    optionButtonTextActive: {
      color: RetroColors.textLight,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    closeButton: {
      backgroundColor: RetroColors.buttonOrange,
      borderRadius: 6,
      paddingVertical: 12,
      paddingHorizontal: 24,
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
      marginTop: 20,
      alignItems: 'center',
    },
    closeButtonText: {
      color: RetroColors.textLight,
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: 'monospace',
    },
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>⚙️ SETTINGS ⚙️</Text>
            <Text style={styles.closeHint}>Swipe down or tap close to exit</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Calculator Mode */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Calculator Mode</Text>
              <View style={styles.optionContainer}>
                <View style={styles.buttonGroup}>
                  <Pressable
                    style={[
                      styles.optionButton,
                      settings.mode === 'checkbook' && styles.optionButtonActive,
                    ]}
                    onPress={() => handleModeChange('checkbook')}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        settings.mode === 'checkbook' &&
                          styles.optionButtonTextActive,
                      ]}
                    >
                      Checkbook
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.optionButton,
                      settings.mode === 'scientific' &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() => handleModeChange('scientific')}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        settings.mode === 'scientific' &&
                          styles.optionButtonTextActive,
                      ]}
                    >
                      Scientific
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* LCD Color */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>LCD Color</Text>
              <View style={styles.optionContainer}>
                <View style={styles.buttonGroup}>
                  <Pressable
                    style={[
                      styles.optionButton,
                      settings.lcdColor === 'amber' &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() => handleLcdColorChange('amber')}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        settings.lcdColor === 'amber' &&
                          styles.optionButtonTextActive,
                      ]}
                    >
                      🟡 Amber
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.optionButton,
                      settings.lcdColor === 'green' &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() => handleLcdColorChange('green')}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        settings.lcdColor === 'green' &&
                          styles.optionButtonTextActive,
                      ]}
                    >
                      🟢 Green
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Sound Effects */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sound Effects</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.optionLabel}>Enable Sounds</Text>
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={handleSoundToggle}
                  trackColor={{
                    false: RetroColors.buttonGray,
                    true: RetroColors.successGreen,
                  }}
                  thumbColor={
                    settings.soundEnabled
                      ? RetroColors.buttonOrange
                      : RetroColors.buttonRed
                  }
                />
              </View>
            </View>

            {/* History Retention */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>History Retention</Text>
              <Text style={styles.optionLabel}>
                Auto-delete older than:
              </Text>
              <View style={styles.buttonGroup}>
                {([30, 60, 90] as const).map((days) => (
                  <Pressable
                    key={days}
                    style={[
                      styles.optionButton,
                      settings.retentionDays === days &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() => handleRetentionChange(days)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        settings.retentionDays === days &&
                          styles.optionButtonTextActive,
                      ]}
                    >
                      {days}d
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Mode Warning */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.optionLabel}>Show Mode Warning</Text>
                <Switch
                  value={settings.showModeWarning}
                  onValueChange={handleShowModeWarningToggle}
                  trackColor={{
                    false: RetroColors.buttonGray,
                    true: RetroColors.successGreen,
                  }}
                  thumbColor={
                    settings.showModeWarning
                      ? RetroColors.buttonOrange
                      : RetroColors.buttonRed
                  }
                />
              </View>
            </View>
          </ScrollView>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>CLOSE</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default SettingsModal;
