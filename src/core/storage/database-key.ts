import { getRandomBytes } from 'expo-crypto';

import type { SecureStorage } from './secure-storage';

const KEY = 'db.encryption-key';

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

export async function loadDatabaseKey(storage: SecureStorage): Promise<string> {
  const existing = await storage.get(KEY);
  if (existing) return existing;
  const key = toHex(getRandomBytes(32));
  await storage.set(KEY, key);
  return key;
}
