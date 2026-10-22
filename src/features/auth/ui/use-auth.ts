import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useContainer } from '@/di/container-context';

import type { Credentials } from '../domain/session';
import { sessionActions } from '../session-store';

export function useSignIn() {
  const { auth } = useContainer();
  return useMutation({
    mutationFn: (credentials: Credentials) => auth.signIn(credentials),
    onSuccess: sessionActions.signedIn,
  });
}

export function useSignOut() {
  const container = useContainer();
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: () => container.signOut(),
    onSettled: () => {
      queryClient.clear();
      sessionActions.signedOut();
    },
  });
}
