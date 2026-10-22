import * as LocalAuthentication from 'expo-local-authentication';
import { create } from 'zustand';

import { usePreferences } from '@/features/settings/preferences-store';

export const LOCK_AFTER_MS = 30_000;

export function shouldLock(enabled: boolean, backgroundedAt: number | null, now: number) {
  return enabled && backgroundedAt !== null && now - backgroundedAt >= LOCK_AFTER_MS;
}

// Preferences hydrate synchronously from MMKV, so a protected app starts locked.
export const useAppLockStore = create<{ locked: boolean; backgroundedAt: number | null }>(() => ({
  locked: usePreferences.getState().appLock,
  backgroundedAt: null,
}));

export async function canUseAppLock() {
  const level = await LocalAuthentication.getEnrolledLevelAsync();
  return level !== LocalAuthentication.SecurityLevel.NONE;
}

export async function authenticate(promptMessage: string) {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    disableDeviceFallback: false,
  });
  return result.success;
}
