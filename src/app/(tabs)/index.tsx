import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { translateError } from '@/core/i18n/translate-error';
import { EmptyState } from '@/core/ui/empty-state';
import { ScreenHeader } from '@/core/ui/screen-header';
import { SyncBanner } from '@/core/ui/sync-banner';
import { useSession } from '@/features/auth';
import { CatalogFilters, ProductCard, useCatalogFilter, useProducts } from '@/features/catalog';

export default function CatalogScreen() {
  const { t } = useTranslation();
  const firstName = useSession((state) => state.user?.name.split(' ')[0] ?? '');
  const query = useCatalogFilter((state) => state.query);
  const products = useProducts();

  return (
    <FlashList
      data={products.data ?? []}
      numColumns={2}
      keyExtractor={(product) => product.id}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.header}>
          <ScreenHeader
            eyebrow={t('catalog.greeting', { name: firstName })}
            title={t('catalog.title')}
          />
          <CatalogFilters />
          <SyncBanner />
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.cell}>
          <ProductCard product={item} />
        </View>
      )}
      ListEmptyComponent={
        products.isPending ? (
          <ActivityIndicator style={styles.loading} />
        ) : products.isError ? (
          <EmptyState
            icon="cloud-offline-outline"
            title={translateError(t, products.error)}
            action={{ label: t('common.retry'), onPress: () => void products.refetch() }}
          />
        ) : (
          <EmptyState
            icon="search"
            title={t('catalog.empty', { query })}
            body={t('catalog.emptyHint')}
          />
        )
      }
      refreshing={products.isRefetching}
      onRefresh={() => void products.refetch()}
      testID="catalog-list"
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  content: { paddingHorizontal: theme.space(3.5), paddingBottom: theme.space(6) },
  header: {
    gap: theme.space(5),
    paddingHorizontal: theme.space(1.5),
    paddingTop: theme.space(4),
    paddingBottom: theme.space(5),
  },
  cell: { flex: 1, paddingHorizontal: theme.space(1.5), paddingBottom: theme.space(3) },
  loading: { marginTop: theme.space(16) },
}));
