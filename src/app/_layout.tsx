import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { changeLanguage, initI18n } from '@/core/i18n/i18n';
import { applyThemePreference } from '@/core/theme/theme-mode';
import { AppProviders } from '@/di/app-providers';
import { AppLockGate } from '@/features/app-lock';
import { useSession } from '@/features/auth';
import { usePreferences } from '@/features/settings';

initI18n(usePreferences.getState().language);
applyThemePreference(usePreferences.getState().theme);
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const theme = usePreferences((state) => state.theme);
  const language = usePreferences((state) => state.language);

  useEffect(() => applyThemePreference(theme), [theme]);
  useEffect(() => {
    void changeLanguage(language);
  }, [language]);

  const onReady = useCallback((error?: Error) => {
    if (error) console.error(error);
    SplashScreen.hide();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProviders onReady={onReady}>
        <RootNavigator />
        <AppLockGate />
      </AppProviders>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const signedIn = useSession((state) => state.status === 'signed-in');

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="product/[id]"
          options={{
            headerTransparent: true,
            headerStyle: { backgroundColor: 'transparent' },
            title: '',
          }}
        />
        <Stack.Screen name="checkout" options={{ title: t('checkout.title') }} />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
}));
