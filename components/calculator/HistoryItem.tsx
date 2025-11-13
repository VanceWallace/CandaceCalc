/**
 * History item component
 * Displays a single calculation entry in the receipt tape
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { CalculationHistory } from '@/types/calculator';
import { RetroColors } from '@/constants/Colors';
import { formatHistoryTimestamp } from '@/utils/dateFormatter';

interface HistoryItemProps {
  item: CalculationHistory;
  onPress: () => void;
  isColorCoded?: boolean;
  isAddition?: boolean;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  onPress,
  isColorCoded = false,
  isAddition = false,
}) => {
  const backgroundColor = isColorCoded
    ? isAddition
      ? 'rgba(144, 238, 144, 0.1)' // Light green
      : 'rgba(255, 182, 193, 0.1)' // Light red
    : RetroColors.paperWhite;

  const styles = StyleSheet.create({
    container: {
      backgroundColor,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: RetroColors.paperDots,
      marginHorizontal: 8,
    },
    pressable: {
      padding: 8,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    expression: {
      fontSize: 12,
      color: RetroColors.textDark,
      fontFamily: 'monospace',
      flex: 1,
    },
    result: {
      fontSize: 12,
      color: RetroColors.textDark,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      marginLeft: 8,
    },
    timestamp: {
      fontSize: 10,
      color: RetroColors.textGray,
      fontFamily: 'monospace',
      marginTop: 2,
      fontStyle: 'italic',
    },
  });

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
    >
      <View style={styles.pressable}>
        <View style={styles.row}>
          <Text style={styles.expression} numberOfLines={1}>
            {item.expression}
          </Text>
          <Text style={styles.result}>{item.displayResult}</Text>
        </View>
        <Text style={styles.timestamp}>
          {formatHistoryTimestamp(item.timestamp)}
        </Text>
      </View>
    </Pressable>
  );
};

export default HistoryItem;
