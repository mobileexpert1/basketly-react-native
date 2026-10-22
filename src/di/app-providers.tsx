import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { env, type Backend } from '@/core/config/env';
import type { AppDatabase } from '@/core/db/database';
import { openDatabase } from '@/core/db/open-database';
import { loadDatabaseKey } from '@/core/storage/database-key';
import { deviceSecureStorage } from '@/core/storage/secure-storage';
import { useSyncStore } from '@/core/sync/sync-store';
import { sessionActions, useSession } from '@/features/auth/session-store';
import { usePreferences } from '@/features/settings/preferences-store';

import { createContainer, type Container } from './container';
import { ContainerContext } from './container-context';
import { createQueryClient, persistOptions } from './query-client';
import { useRequestSync } from './use-request-sync';

export function effectiveBackend(preference: Backend): Backend {
  return preference === 'rest' && env.apiUrl ? 'rest' : 'mock';
}

export function AppProviders({
  children,
  onReady,
}: {
  children: ReactNode;
  onReady: (error?: Error) => void;
}) {
  const [db, setDb] = useState<AppDatabase | null>(null);
  const [queryClient] = useState(createQueryClient);
  const backend = effectiveBackend(usePreferences((state) => state.backend));

  useEffect(() => {
    loadDatabaseKey(deviceSecureStorage)
      .then(openDatabase)
      .then(setDb)
      .catch((error: Error) => onReady(error));
  }, [onReady]);

  const container = useMemo(
    () =>
      db
        ? createContainer({
            env,
            backend,
            db,
            secureStorage: deviceSecureStorage,
            onSessionExpired: () => sessionActions.signedOut('expired'),
            onSyncChange: (snapshot) => useSyncStore.setState(snapshot),
          })
        : null,
    [db, backend],
  );

  useEffect(() => {
    if (!container) return;
    useSyncStore.setState(container.sync.current);
    container.auth
      .restore()
      .then((user) => (user ? sessionActions.signedIn(user) : sessionActions.signedOut()))
      .finally(() => onReady());
  }, [container, onReady]);

  if (!container) return null;

  return (
    <ContainerContext value={container}>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <SyncCoordinator container={container} />
        {children}
      </PersistQueryClientProvider>
    </ContainerContext>
  );
}

function SyncCoordinator({ container }: { container: Container }) {
  const requestSync = useRequestSync();
  const simulateOffline = usePreferences((state) => state.simulateOffline);
  const signedIn = useSession((state) => state.status === 'signed-in');

  useEffect(() => {
    container.mockServer?.setOffline(simulateOffline);
    return NetInfo.addEventListener((state) => {
      const online = state.isConnected !== false && !(container.mockServer && simulateOffline);
      onlineManager.setOnline(online);
    });
  }, [container, simulateOffline]);

  useEffect(() => {
    if (!signedIn) return;
    requestSync();
    const unsubscribeOnline = onlineManager.subscribe((online) => online && requestSync());
    const appState = AppState.addEventListener(
      'change',
      (state) => state === 'active' && requestSync(),
    );
    return () => {
      unsubscribeOnline();
      appState.remove();
    };
  }, [requestSync, signedIn]);

  return null;
}
