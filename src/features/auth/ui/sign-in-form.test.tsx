import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import type { Container } from '@/di/container';
import { ContainerContext } from '@/di/container-context';

import { DEMO_CREDENTIALS } from '../domain/session';
import { useSession } from '../session-store';
import { SignInForm } from './sign-in-form';

const user = { id: 'u1', name: 'Alex Morgan', email: DEMO_CREDENTIALS.email };

function renderForm(signIn: jest.Mock) {
  const container = { auth: { signIn } } as unknown as Container;
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ContainerContext value={container}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ContainerContext>
  );
  return render(<SignInForm />, { wrapper });
}

describe('SignInForm', () => {
  it('shows translated validation errors and does not submit', async () => {
    const signIn = jest.fn();
    await renderForm(signIn);

    await fireEvent.changeText(screen.getByTestId('sign-in-email'), 'not-an-email');
    await fireEvent.changeText(screen.getByTestId('sign-in-password'), 'short');
    await fireEvent.press(screen.getByTestId('sign-in'));

    expect(await screen.findByText('Enter a valid email address')).toBeOnTheScreen();
    expect(screen.getByText('At least 8 characters')).toBeOnTheScreen();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('signs in with the demo account', async () => {
    const signIn = jest.fn().mockResolvedValue(user);
    await renderForm(signIn);

    await fireEvent.press(screen.getByTestId('sign-in-demo'));

    await waitFor(() => expect(useSession.getState()).toMatchObject({ status: 'signed-in', user }));
    expect(signIn.mock.calls[0]?.[0]).toEqual(DEMO_CREDENTIALS);
  });
});
