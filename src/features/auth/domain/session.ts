import { z } from 'zod';

export interface User {
  id: string;
  name: string;
  email: string;
}

export const CredentialsSchema = z.object({
  email: z.string().trim().pipe(z.email('validation.email')),
  password: z.string().min(8, 'validation.password'),
});

export type Credentials = z.infer<typeof CredentialsSchema>;

export interface AuthRepository {
  signIn(credentials: Credentials): Promise<User>;
  restore(): Promise<User | null>;
  signOut(): Promise<void>;
}

export const DEMO_CREDENTIALS: Credentials = {
  email: 'demo@basketly.app',
  password: 'basketly-demo',
};
