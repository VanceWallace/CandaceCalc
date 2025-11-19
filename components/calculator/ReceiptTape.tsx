/**
 * Receipt tape component
 * Displays calculation history in thermal printer paper aesthetic
 * Latest calculation at top, swipe DOWN to see older calculations
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { CalculationHistory } from '@/types/calculator';
import { RetroColors } from '@/constants/Colors';
import { HistoryItem } from './HistoryItem';

interface ReceiptTapeProps {
  history: CalculationHistory[];
  onHistoryItemSelect: (item: CalculationHistory) => void;
  isLoading?: boolean;
  mode?: 'checkbook' | 'scientific';
}

export const ReceiptTape: React.FC<ReceiptTapeProps> = ({
  history,
  onHistoryItemSelect,
  isLoading = false,
  mode = 'checkbook',
}) => {
  const { height: windowHeight } = useWindowDimensions();
  const maxHeight = Math.min(windowHeight * 0.35, 300);

  // Determine if entry is an addition or subtraction (for color coding in checkbook mode)
  const isAddition = useCallback((expression: string): boolean => {
    return expression.includes('+') && !expression.includes('-');
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CalculationHistory }) => (
      <HistoryItem
        item={item}
        onPress={() => onHistoryItemSelect(item)}
        isColorCoded={mode === 'checkbook'}
        isAddition={isAddition(item.expression)}
      />
    ),
    [mode, onHistoryItemSelect, isAddition]
  );

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No calculations yet</Text>
      <Text style={styles.emptySubtext}>
        Start by entering numbers and operations
      </Text>
    </View>
  ), []);

  const styles = StyleSheet.create({
    container: {
      maxHeight,
      backgroundColor: RetroColors.paperWhite,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: RetroColors.casingBrown,
      overflow: 'hidden',
      marginBottom: 12,
      ...Platform.select({
        web: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
        },
        default: {
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        },
      }),
    },
    header: {
      backgroundColor: RetroColors.casingBrown,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderBottomWidth: 2,
      borderBottomColor: RetroColors.casingDark,
    },
    headerText: {
      color: RetroColors.textLight,
      fontSize: 10,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      textAlign: 'center',
      letterSpacing: 2,
    },
    flatList: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
    },
    emptyText: {
      fontSize: 14,
      color: RetroColors.textGray,
      fontFamily: 'monospace',
      fontWeight: 'bold',
    },
    emptySubtext: {
      fontSize: 11,
      color: RetroColors.textGray,
      fontFamily: 'monospace',
      marginTop: 4,
      fontStyle: 'italic',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    footer: {
      backgroundColor: RetroColors.paperWhite,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderTopWidth: 1,
      borderTopColor: RetroColors.paperDots,
    },
    footerText: {
      fontSize: 9,
      color: RetroColors.textGray,
      fontFamily: 'monospace',
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {'⚙ CALCULATION HISTORY ⚙'}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RetroColors.casingBrown} />
        </View>
      ) : (
        <FlatList
          style={styles.flatList}
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          scrollEnabled={history.length > 3}
          showsVerticalScrollIndicator={true}
          scrollIndicatorInsets={{ right: 1 }}
          // Note: FlatList is rendered in normal order (newest first due to our data ordering)
          // Swiping DOWN will naturally scroll down to reveal older entries
        />
      )}

      {!isLoading && history.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {'↓ Swipe DOWN to view older calculations ↓'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ReceiptTape;
