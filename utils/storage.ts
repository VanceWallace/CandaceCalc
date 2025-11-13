/**
 * AsyncStorage utilities for history and settings persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalculationHistory, AppSettings } from '@/types/calculator';
import { STORAGE_KEYS } from '@/constants/calculator';

/**
 * Save calculation to history
 */
export async function saveCalculationToHistory(
  expression: string,
  result: number,
  displayResult: string
): Promise<CalculationHistory | null> {
  try {
    const history = await getHistory();
    const newEntry: CalculationHistory = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: Date.now(),
      displayResult,
    };

    history.unshift(newEntry); // Add to beginning (newest first)
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return newEntry;
  } catch (error) {
    console.error('Error saving calculation to history:', error);
    return null;
  }
}

/**
 * Get all history items
 */
export async function getHistory(): Promise<CalculationHistory[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving history:', error);
    return [];
  }
}

/**
 * Clear all history
 */
export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

/**
 * Auto-cleanup old history based on retention days
 */
export async function autoCleanupHistory(retentionDays: number): Promise<number> {
  try {
    const history = await getHistory();
    const now = Date.now();
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

    const filtered = history.filter((item) => now - item.timestamp < retentionMs);
    const removedCount = history.length - filtered.length;

    if (removedCount > 0) {
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
    }

    return removedCount;
  } catch (error) {
    console.error('Error cleaning up history:', error);
    return 0;
  }
}

/**
 * Delete a specific history item
 */
export async function deleteHistoryItem(id: string): Promise<void> {
  try {
    const history = await getHistory();
    const filtered = history.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting history item:', error);
  }
}

/**
 * Get default app settings
 */
export function getDefaultSettings(): AppSettings {
  return {
    mode: 'checkbook',
    lcdColor: 'amber',
    soundEnabled: true,
    retentionDays: 90,
    currencySymbol: '$',
    showModeWarning: true,
  };
}

/**
 * Load app settings
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...getDefaultSettings(), ...JSON.parse(data) };
    }
    return getDefaultSettings();
  } catch (error) {
    console.error('Error loading settings:', error);
    return getDefaultSettings();
  }
}

/**
 * Save app settings
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

/**
 * Get last balance (for checkbook mode)
 */
export async function getLastBalance(): Promise<number> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_BALANCE);
    return data ? parseFloat(data) : 0;
  } catch (error) {
    console.error('Error getting last balance:', error);
    return 0;
  }
}

/**
 * Save last balance (for checkbook mode)
 */
export async function saveLastBalance(balance: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_BALANCE, balance.toString());
  } catch (error) {
    console.error('Error saving last balance:', error);
  }
}
