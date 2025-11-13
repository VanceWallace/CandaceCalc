/**
 * Audio sounds hook for calculator
 * Handles loading and playing sound effects
 */

import { useEffect, useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import { SOUNDS } from '@/constants/calculator';

export interface SoundManager {
  playButtonTap: () => Promise<void>;
  playPrinter: () => Promise<void>;
  isReady: boolean;
  cleanup: () => Promise<void>;
}

export function useSounds(enabled: boolean = true): SoundManager {
  const [isReady, setIsReady] = useState(false);
  const [sounds, setSounds] = useState<{ [key: string]: Audio.Sound | null }>({});

  /**
   * Initialize audio and load sounds
   */
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Set audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Note: In production, you would load actual sound files here
        // For now, we're creating empty sounds to prevent errors
        // Replace require() paths with actual audio files:
        // const { sound: buttonSound } = await Audio.Sound.createAsync(require('@/assets/sounds/button-tap.mp3'));
        // const { sound: printerSound } = await Audio.Sound.createAsync(require('@/assets/sounds/printer.mp3'));

        setSounds({
          [SOUNDS.BUTTON_TAP]: null, // Placeholder
          [SOUNDS.PRINTER]: null, // Placeholder
        });

        setIsReady(true);
      } catch (error) {
        console.error('Error initializing audio:', error);
        setIsReady(false);
      }
    };

    if (enabled) {
      initializeAudio();
    }

    return () => {
      // Cleanup on unmount
      Object.values(sounds).forEach((sound) => {
        if (sound) {
          sound.unloadAsync();
        }
      });
    };
  }, [enabled]);

  /**
   * Play button tap sound
   */
  const playButtonTap = useCallback(async () => {
    if (!enabled || !isReady) return;

    try {
      const sound = sounds[SOUNDS.BUTTON_TAP];
      if (sound) {
        await sound.replayAsync();
      }
      // Fallback: use built-in vibration
      // import { Haptics } from 'expo';
      // await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Light);
    } catch (error) {
      console.error('Error playing button sound:', error);
    }
  }, [sounds, enabled, isReady]);

  /**
   * Play printer sound (when saving to history)
   */
  const playPrinter = useCallback(async () => {
    if (!enabled || !isReady) return;

    try {
      const sound = sounds[SOUNDS.PRINTER];
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.error('Error playing printer sound:', error);
    }
  }, [sounds, enabled, isReady]);

  /**
   * Cleanup sounds
   */
  const cleanup = useCallback(async () => {
    try {
      for (const sound of Object.values(sounds)) {
        if (sound) {
          await sound.unloadAsync();
        }
      }
    } catch (error) {
      console.error('Error cleaning up sounds:', error);
    }
  }, [sounds]);

  return {
    playButtonTap,
    playPrinter,
    isReady,
    cleanup,
  };
}
