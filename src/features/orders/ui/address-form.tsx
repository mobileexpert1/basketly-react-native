import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, View, type TextInputProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { translateValidation } from '@/core/i18n/translate-error';
import { Button } from '@/core/ui/button';
import { Chip } from '@/core/ui/chip';
import { Text } from '@/core/ui/text';
import { TextField } from '@/core/ui/text-field';

import { AddressSchema, COUNTRIES, type Address, type AddressInput } from '../domain/address';

interface AddressFormProps {
  defaultValues: AddressInput;
  submitLabel: string;
  submitting: boolean;
  disabled?: boolean;
  onSubmit: (address: Address) => void;
}

export function AddressForm({
  defaultValues,
  submitLabel,
  submitting,
  disabled,
  onSubmit,
}: AddressFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, setFocus } = useForm<AddressInput, unknown, Address>({
    resolver: zodResolver(AddressSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const field = (
    name: Exclude<FieldPath<AddressInput>, 'country'>,
    label: string,
    props: TextInputProps = {},
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
        <TextField
          ref={ref}
          label={label}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={translateValidation(t, fieldState.error?.message)}
          testID={`field-${name}`}
          {...props}
        />
      )}
    />
  );

  return (
    <View style={styles.form}>
      <Section title={t('checkout.contact')}>
        {field('fullName', t('checkout.fullName'), {
          autoComplete: 'name',
          textContentType: 'name',
          returnKeyType: 'next',
          onSubmitEditing: () => setFocus('email'),
        })}
        {field('email', t('checkout.email'), {
          autoComplete: 'email',
          keyboardType: 'email-address',
          autoCapitalize: 'none',
          textContentType: 'emailAddress',
          returnKeyType: 'next',
          onSubmitEditing: () => setFocus('line1'),
        })}
      </Section>

      <Section title={t('checkout.shipping')}>
        <Controller
          control={control}
          name="country"
          render={({ field: { value, onChange } }) => (
            <View style={styles.countryField}>
              <Text variant="label" tone="muted">
                {t('checkout.country')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.countries}
                style={styles.countryScroller}
              >
                {COUNTRIES.map((code) => (
                  <Chip
                    key={code}
                    label={t(`checkout.countries.${code}`)}
                    selected={value === code}
                    onPress={() => onChange(code)}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        />
        {field('line1', t('checkout.line1'), {
          autoComplete: 'street-address',
          textContentType: 'streetAddressLine1',
          returnKeyType: 'next',
          onSubmitEditing: () => setFocus('line2'),
        })}
        {field('line2', t('checkout.line2'), {
          textContentType: 'streetAddressLine2',
          returnKeyType: 'next',
          onSubmitEditing: () => setFocus('postalCode'),
        })}
        <View style={styles.row}>
          <View style={styles.postal}>
            {field('postalCode', t('checkout.postalCode'), {
              autoComplete: 'postal-code',
              textContentType: 'postalCode',
              autoCapitalize: 'characters',
              returnKeyType: 'next',
              onSubmitEditing: () => setFocus('city'),
            })}
          </View>
          <View style={styles.city}>
            {field('city', t('checkout.city'), {
              textContentType: 'addressCity',
              returnKeyType: 'done',
            })}
          </View>
        </View>
      </Section>

      <Button
        label={submitLabel}
        icon="lock-closed"
        loading={submitting}
        disabled={disabled}
        onPress={handleSubmit(onSubmit)}
        testID="pay-button"
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.space(6) },
  section: { gap: theme.space(3.5) },
  countryField: { gap: theme.space(1.5) },
  countryScroller: { marginHorizontal: -theme.space(5) },
  countries: { gap: theme.space(2), paddingHorizontal: theme.space(5) },
  row: { flexDirection: 'row', gap: theme.space(3) },
  postal: { flex: 2 },
  city: { flex: 3 },
}));
