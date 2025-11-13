/**
 * Date formatting utilities for human-readable timestamps
 */

import { format, isToday, isYesterday, isThisYear } from 'date-fns';

/**
 * Format timestamp in human-readable format
 * Examples: "Today, 2:30 PM", "Yesterday, 10:45 AM", "Nov 12, 2:30 PM"
 */
export function formatHistoryTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, "'Today,' h:mm a");
  }

  if (isYesterday(date)) {
    return format(date, "'Yesterday,' h:mm a");
  }

  if (isThisYear(date)) {
    return format(date, 'MMM d, h:mm a');
  }

  return format(date, 'MMM d, yyyy, h:mm a');
}

/**
 * Format date for display with full details
 */
export function formatFullDate(timestamp: number): string {
  const date = new Date(timestamp);
  return format(date, 'EEEE, MMMM d, yyyy h:mm a');
}

/**
 * Format time only
 */
export function formatTimeOnly(timestamp: number): string {
  const date = new Date(timestamp);
  return format(date, 'h:mm a');
}

/**
 * Format date only
 */
export function formatDateOnly(timestamp: number): string {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  if (isThisYear(date)) {
    return format(date, 'MMM d');
  }
  return format(date, 'MMM d, yyyy');
}

/**
 * Check if two timestamps are on the same day
 */
export function isSameDay(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
