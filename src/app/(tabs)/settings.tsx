import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Switch } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { env, type Backend } from '@/core/config/env';
import { useFormat } from '@/core/i18n/format';
import { LANGUAGE_NAMES, LANGUAGES, type LanguagePreference } from '@/core/i18n/i18n';
import { useSyncStore } from '@/core/sync/sync-store';
import type { ThemePreference } from '@/core/theme/theme-mode';
import { Button } from '@/core/ui/button';
import { ScreenHeader } from '@/core/ui/screen-header';
import { SegmentedControl } from '@/core/ui/segmented-control';
import { Text } from '@/core/ui/text';
import { useContainer } from '@/di/container-context';
import { authenticate, canUseAppLock } from '@/features/app-lock';
import { useSession, useSignOut } from '@/features/auth';
import { SettingsGroup, SettingsRow, usePreferences } from '@/features/settings';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const format = useFormat();
  const preferences = usePreferences();
  const { backend } = useContainer();
  const user = useSession((state) => state.user);
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt);
  const signOut = useSignOut();

  const toggleAppLock = async (enabled: boolean) => {
    if (enabled && !(await canUseAppLock())) {
      Alert.alert(t('settings.appLock'), t('settings.appLockUnavailable'));
      return;
    }
    if (await authenticate(t('lock.prompt'))) preferences.update({ appLock: enabled });
  };

  const switchBackend = (next: Backend) => {
    if (next === backend) return;
    Alert.alert(t('settings.backend'), t('settings.backendSwitch'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.signOut'),
        style: 'destructive',
        onPress: async () => {
          await signOut.mutateAsync();
          preferences.update({ backend: next, simulateOffline: false });
        },
      },
    ]);
  };

  const switchColors = { true: theme.colors.primary, false: theme.colors.surfaceMuted };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <ScreenHeader title={t('settings.title')} />

      <SettingsGroup title={t('settings.appearance')}>
        <SettingsRow label={t('settings.themeLabel')} stacked>
          <SegmentedControl<ThemePreference>
            accessibilityLabel={t('settings.appearance')}
            value={preferences.theme}
            onChange={(value) => preferences.update({ theme: value })}
            options={(['system', 'light', 'dark'] as const).map((value) => ({
              value,
              label: t(`settings.theme.${value}`),
            }))}
          />
        </SettingsRow>
        <SettingsRow label={t('settings.language')} stacked>
          <SegmentedControl<LanguagePreference>
            accessibilityLabel={t('settings.language')}
            value={preferences.language}
            onChange={(value) => preferences.update({ language: value })}
            options={[
              { value: 'system', label: t('settings.systemLanguage') },
              ...LANGUAGES.map((value) => ({ value, label: LANGUAGE_NAMES[value] })),
            ]}
          />
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title={t('settings.security')} footer={t('settings.appLockHint')}>
        <SettingsRow label={t('settings.appLock')}>
          <Switch
            value={preferences.appLock}
            onValueChange={(value) => void toggleAppLock(value)}
            trackColor={switchColors}
            accessibilityLabel={t('settings.appLock')}
            testID="app-lock-switch"
          />
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup
        title={t('settings.data')}
        footer={
          lastSyncedAt ? t('settings.lastSynced', { time: format.time(lastSyncedAt) }) : undefined
        }
      >
        <SettingsRow
          label={t('settings.backend')}
          detail={env.apiUrl ? undefined : t('settings.backendRestUnavailable')}
          stacked
        >
          <SegmentedControl<Backend>
            accessibilityLabel={t('settings.backend')}
            value={backend}
            onChange={(value) =>
              value === 'rest' && !env.apiUrl ? undefined : switchBackend(value)
            }
            options={[
              { value: 'mock', label: t('settings.backendMock') },
              { value: 'rest', label: t('settings.backendRest') },
            ]}
          />
        </SettingsRow>
        {backend === 'mock' && (
          <SettingsRow
            label={t('settings.simulateOffline')}
            detail={t('settings.simulateOfflineHint')}
          >
            <Switch
              value={preferences.simulateOffline}
              onValueChange={(value) => preferences.update({ simulateOffline: value })}
              trackColor={switchColors}
              accessibilityLabel={t('settings.simulateOffline')}
              testID="simulate-offline-switch"
            />
          </SettingsRow>
        )}
      </SettingsGroup>

      <SettingsGroup title={t('settings.account')}>
        <SettingsRow label={user?.name ?? ''} detail={user?.email} />
      </SettingsGroup>

      <Button
        variant="secondary"
        icon="log-out-outline"
        label={t('settings.signOut')}
        loading={signOut.isPending}
        onPress={() => signOut.mutate()}
        testID="sign-out"
      />
      <Text variant="caption" tone="muted" style={styles.version}>
        {t('settings.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: { gap: theme.space(6), padding: theme.space(5), paddingTop: theme.space(4) },
  version: { textAlign: 'center' },
}));
