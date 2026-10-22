import { render, screen } from '@testing-library/react-native';

import { i18n } from '@/core/i18n/i18n';

import { lamp, mug } from '../../../../test/fixtures';
import { addItem, cartTotals } from '../domain/cart';
import { CartSummary } from './cart-summary';

describe('CartSummary', () => {
  afterEach(() => i18n.changeLanguage('en'));

  it('shows totals and how much is left for free shipping', async () => {
    await render(<CartSummary totals={cartTotals(addItem([], mug, 2))} />);

    expect(screen.getByText('Add €39.00 more for free shipping')).toBeOnTheScreen();
    expect(screen.getByText('€40.90')).toBeOnTheScreen();
  });

  it('formats money for the active language', async () => {
    await i18n.changeLanguage('de');
    await render(<CartSummary totals={cartTotals(addItem([], lamp))} />);

    expect(screen.getByText('Dein Versand ist kostenlos')).toBeOnTheScreen();
    expect(screen.getAllByText('120,00 €')).toHaveLength(2);
  });
});
