import { Ionicons } from '@expo/vector-icons';
import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useSyncStore } from '../sync/sync-store';
import { Text } from './text';

export function useIsOnline() {
  return useSyncExternalStore(onlineManager.subscribe.bind(onlineManager), () =>
    onlineManager.isOnline(),
  );
}

export function SyncBanner() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const online = useIsOnline();
  const pending = useSyncStore((state) => state.pending);
  const stalled = useSyncStore((state) => state.state === 'unreachable');

  if (online && !(stalled && pending > 0)) return null;

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={styles.banner}
      accessibilityLiveRegion="polite"
      testID="sync-banner"
    >
      <Ionicons
        name={online ? 'sync' : 'cloud-offline-outline'}
        size={18}
        color={theme.colors.warning}
      />
      <View style={styles.text}>
        {!online && <Text variant="label">{t('common.offline')}</Text>}
        {pending > 0 && (
          <Text variant="caption" tone="muted">
            {t('common.pendingSync', { count: pending })}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(3),
    padding: theme.space(3),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  text: { flex: 1, gap: 2 },
}));
