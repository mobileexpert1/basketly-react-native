import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { isApiError } from '@/core/api/errors';
import { translateError, translateValidation } from '@/core/i18n/translate-error';
import { Button } from '@/core/ui/button';
import { Text } from '@/core/ui/text';
import { TextField } from '@/core/ui/text-field';

import { CredentialsSchema, DEMO_CREDENTIALS, type Credentials } from '../domain/session';
import { useSession } from '../session-store';
import { useSignIn } from './use-auth';

export function SignInForm() {
  const { t } = useTranslation();
  const signIn = useSignIn();
  const expired = useSession(
    (state) => state.status === 'signed-out' && state.reason === 'expired',
  );
  const { control, handleSubmit, setFocus } = useForm<Credentials>({
    resolver: zodResolver(CredentialsSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const submit = handleSubmit((credentials) => signIn.mutate(credentials));
  const error = signIn.error
    ? isApiError(signIn.error) && signIn.error.kind === 'unauthorized'
      ? t('auth.invalidCredentials')
      : translateError(t, signIn.error)
    : expired
      ? t('auth.sessionExpired')
      : null;

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            ref={field.ref}
            label={t('auth.email')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={translateValidation(t, fieldState.error?.message)}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="username"
            returnKeyType="next"
            onSubmitEditing={() => setFocus('password')}
            testID="sign-in-email"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            ref={field.ref}
            label={t('auth.password')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={translateValidation(t, fieldState.error?.message)}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={() => void submit()}
            testID="sign-in-password"
          />
        )}
      />
      {error ? (
        <Text tone="danger" accessibilityLiveRegion="assertive">
          {error}
        </Text>
      ) : null}
      <Button
        label={t('auth.signIn')}
        loading={signIn.isPending}
        onPress={() => void submit()}
        testID="sign-in"
      />
      <Button
        variant="ghost"
        label={t('auth.useDemo')}
        icon="sparkles-outline"
        disabled={signIn.isPending}
        onPress={() => signIn.mutate(DEMO_CREDENTIALS)}
        testID="sign-in-demo"
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.space(4) },
}));
