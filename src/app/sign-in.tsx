import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Text } from '@/core/ui/text';
import { SignInForm } from '@/features/auth';

export default function SignInScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Ionicons name="basket" size={30} color={theme.colors.onPrimary} />
          </View>
          <Text variant="display">{t('auth.title')}</Text>
          <Text tone="muted">{t('auth.subtitle')}</Text>
        </View>
        <SignInForm />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: theme.space(10),
    paddingHorizontal: theme.space(6),
    paddingTop: rt.insets.top + theme.space(6),
    paddingBottom: rt.insets.bottom + theme.space(6),
  },
  brand: { gap: theme.space(3) },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    marginBottom: theme.space(2),
  },
}));
