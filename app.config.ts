import type { ConfigContext, ExpoConfig } from 'expo/config';

const IDENTIFIER = 'com.mobileexpert1.basketly';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Basketly',
  slug: 'basketly',
  scheme: 'basketly',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: IDENTIFIER,
    supportsTablet: false,
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      NSAppTransportSecurity: { NSAllowsArbitraryLoads: false },
    },
  },
  android: {
    package: IDENTIFIER,
    allowBackup: false,
    adaptiveIcon: {
      backgroundColor: '#1F4D3F',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: true,
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 120,
        backgroundColor: '#F6F3EE',
        dark: { backgroundColor: '#121412' },
      },
    ],
    ['expo-sqlite', { useSQLCipher: true }],
    'expo-localization',
    'expo-secure-store',
    [
      'expo-local-authentication',
      { faceIDPermission: 'Allow $(PRODUCT_NAME) to unlock the app with Face ID.' },
    ],
    'react-native-edge-to-edge',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
