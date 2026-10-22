import { DEMO_CREDENTIALS, type User } from '@/features/auth/domain/session';

export const DEMO_USER: User = {
  id: 'usr_demo',
  name: 'Alex Morgan',
  email: DEMO_CREDENTIALS.email,
};
