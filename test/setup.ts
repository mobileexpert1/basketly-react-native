import 'react-native-unistyles/mocks';
import '@/core/theme/unistyles';

import { initI18n } from '@/core/i18n/i18n';

jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('./mocks/reanimated'));

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

jest.mock('expo-crypto', () => {
  const crypto = jest.requireActual<typeof import('node:crypto')>('node:crypto');
  return {
    randomUUID: () => crypto.randomUUID(),
    getRandomBytes: (size: number) => new Uint8Array(crypto.randomBytes(size)),
  };
});

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', languageTag: 'en-US' }],
}));

initI18n('en');
