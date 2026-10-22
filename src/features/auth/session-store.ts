import { create } from 'zustand';

import type { User } from './domain/session';

type SessionState =
  | { status: 'restoring'; user: null }
  | { status: 'signed-out'; user: null; reason?: 'expired' }
  | { status: 'signed-in'; user: User };

export const useSession = create<SessionState>(() => ({ status: 'restoring', user: null }));

export const sessionActions = {
  signedIn: (user: User) => useSession.setState({ status: 'signed-in', user }),
  signedOut: (reason?: 'expired') =>
    useSession.setState({ status: 'signed-out', user: null, reason }),
};
