import { useEffect, useRef } from 'react';
import type { FormData } from '@/types';

const STORAGE_KEY = 'eltex-form-data';
const VERSION = '1.0';

interface StoredFormData extends FormData {
  version: string;
  timestamp: number;
  currentSection?: string;
}

/**
 * Hook to persist and restore form data
 * Uses localStorage for persistence and URL params for sharing
 */
export const useFormPersistence = (
  formData: FormData,
  currentSection: string,
  onSave?: (data: StoredFormData) => void
) => {
  const isRestoring = useRef(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Restore form data on mount
  useEffect(() => {
    const restoreData = () => {
      try {
        // Check URL params first (for shared links)
        const urlParams = new URLSearchParams(window.location.search);
        const sharedData = urlParams.get('data');

        if (sharedData) {
          // Decode shared data from URL
          try {
            const decoded = JSON.parse(atob(sharedData));
            if (decoded.version === VERSION) {
              console.log('Restoring form data from shared link');
              onSave?.(decoded);
              return;
            }
          } catch (e) {
            console.error('Failed to decode shared data:', e);
          }
        }

        // Otherwise, restore from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed: StoredFormData = JSON.parse(stored);
            // Only restore if version matches and data is recent (within 7 days)
            if (parsed.version === VERSION && isRecent(parsed.timestamp)) {
              console.log('Restoring form data from localStorage');
              isRestoring.current = true;
              onSave?.(parsed);
              // Restore current section if available
              if (parsed.currentSection) {
                // Store for parent component to use
                window.dispatchEvent(
                  new CustomEvent('formSectionRestore', { detail: parsed.currentSection })
                );
              }
            }
          } catch (e) {
            console.error('Failed to parse stored data:', e);
          }
        }
      } catch (e) {
        console.error('Failed to restore form data:', e);
      }
    };

    restoreData();
  }, []);

  // Debounced save to localStorage
  useEffect(() => {
    if (isRestoring.current) {
      isRestoring.current = false;
      return;
    }

    // Clear previous timeout
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    // Save after 500ms of inactivity
    saveTimeout.current = setTimeout(() => {
      const dataToStore: StoredFormData = {
        ...formData,
        version: VERSION,
        timestamp: Date.now(),
        currentSection,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
      } catch (e) {
        console.error('Failed to save form data:', e);
      }
    }, 500);

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [formData, currentSection]);

  return {
    isRestoring: isRestoring.current,
  };
};

/**
 * Generate a shareable URL with form data
 */
export const generateShareableUrl = (formData: FormData, currentSection: string): string => {
  const dataToStore: StoredFormData = {
    ...formData,
    version: VERSION,
    timestamp: Date.now(),
    currentSection,
  };

  try {
    const encoded = btoa(JSON.stringify(dataToStore));
    const url = new URL(window.location.href);
    url.searchParams.set('data', encoded);
    return url.toString();
  } catch (e) {
    console.error('Failed to generate shareable URL:', e);
    return window.location.href;
  }
};

/**
 * Clear stored form data
 */
export const clearStoredFormData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear stored data:', e);
  }
};

/**
 * Check if timestamp is recent (within 7 days)
 */
const isRecent = (timestamp: number): boolean => {
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp < SEVEN_DAYS;
};

/**
 * Get stored form data without restoring (for checking if data exists)
 */
export const getStoredFormData = (): StoredFormData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed: StoredFormData = JSON.parse(stored);
    if (parsed.version === VERSION && isRecent(parsed.timestamp)) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Get current section from stored data
 */
export const getStoredSection = (): string | null => {
  const data = getStoredFormData();
  return data?.currentSection || null;
};
