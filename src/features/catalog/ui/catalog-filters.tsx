import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Chip } from '@/core/ui/chip';

import { CATEGORIES } from '../domain/product';
import { useCatalogFilter } from './use-catalog';

export function CatalogFilters() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { query, category, setQuery, setCategory } = useCatalogFilter();

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('catalog.search')}
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.primary}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel={t('catalog.search')}
          style={styles.input}
          testID="catalog-search"
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipScroller}
      >
        <Chip
          label={t('catalog.all')}
          selected={category === null}
          onPress={() => setCategory(null)}
        />
        {CATEGORIES.map((id) => (
          <Chip
            key={id}
            label={t(`catalog.categories.${id}`)}
            selected={category === id}
            onPress={() => setCategory(category === id ? null : id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { gap: theme.space(3) },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(2),
    height: 46,
    paddingHorizontal: theme.space(4),
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: { flex: 1, ...theme.typography.body, color: theme.colors.text },
  chipScroller: { marginHorizontal: -theme.space(5) },
  chips: { gap: theme.space(2), paddingHorizontal: theme.space(5) },
}));
