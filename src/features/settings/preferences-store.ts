import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Backend } from '@/core/config/env';
import type { LanguagePreference } from '@/core/i18n/i18n';
import { kvStateStorage } from '@/core/storage/kv-storage';
import type { ThemePreference } from '@/core/theme/theme-mode';

export interface Preferences {
  theme: ThemePreference;
  language: LanguagePreference;
  appLock: boolean;
  backend: Backend;
  simulateOffline: boolean;
}

interface PreferencesStore extends Preferences {
  update: (patch: Partial<Preferences>) => void;
}

export const usePreferences = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'system',
      appLock: false,
      backend: 'mock',
      simulateOffline: false,
      update: (patch) => set(patch),
    }),
    {
      name: 'preferences',
      version: 1,
      storage: createJSONStorage(() => kvStateStorage),
      partialize: ({ update: _update, ...preferences }) => preferences,
    },
  ),
);
