import { Ionicons } from '@expo/vector-icons';
import { setPrivacyScreenEnabled } from '@modules/privacy-screen';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Button } from '@/core/ui/button';
import { Text } from '@/core/ui/text';
import { usePreferences } from '@/features/settings/preferences-store';

import { authenticate, shouldLock, useAppLockStore } from './app-lock';

export function AppLockGate() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const enabled = usePreferences((state) => state.appLock);
  const locked = useAppLockStore((state) => state.locked);

  useEffect(() => {
    void setPrivacyScreenEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      const { backgroundedAt } = useAppLockStore.getState();
      if (state === 'background') {
        useAppLockStore.setState({ backgroundedAt: Date.now() });
      } else if (state === 'active') {
        const lock = shouldLock(usePreferences.getState().appLock, backgroundedAt, Date.now());
        useAppLockStore.setState((current) => ({
          backgroundedAt: null,
          locked: current.locked || lock,
        }));
      }
    });
    return () => subscription.remove();
  }, []);

  const unlock = useCallback(async () => {
    if (await authenticate(t('lock.prompt'))) useAppLockStore.setState({ locked: false });
  }, [t]);

  useEffect(() => {
    if (locked && AppState.currentState === 'active') void unlock();
  }, [locked, unlock]);

  if (!enabled || !locked) return null;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay} testID="app-lock">
      <View style={styles.badge}>
        <Ionicons name="lock-closed" size={30} color={theme.colors.onPrimary} />
      </View>
      <Text variant="title">{t('lock.title')}</Text>
      <Button label={t('lock.unlock')} icon="finger-print" onPress={unlock} />
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space(5),
    backgroundColor: theme.colors.background,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
}));
