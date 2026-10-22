import { address } from '../../../../test/fixtures';
import { AddressSchema } from './address';

const issues = (input: object) => {
  const result = AddressSchema.safeParse({ ...address, ...input });
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message]));
};

describe('AddressSchema', () => {
  it('accepts a valid address and normalises it', () => {
    const parsed = AddressSchema.parse({
      ...address,
      fullName: '  Alex Morgan ',
      postalCode: 'sw1a 1aa',
      country: 'GB',
    });
    expect(parsed.fullName).toBe('Alex Morgan');
    expect(parsed.postalCode).toBe('SW1A 1AA');
  });

  it('returns translation keys as messages', () => {
    expect(issues({ email: 'not-an-email', fullName: 'A' })).toEqual({
      email: 'validation.email',
      fullName: 'validation.name',
    });
  });

  it.each([
    ['DE', '1011', false],
    ['DE', '10119', true],
    ['NL', '1012 AB', true],
    ['US', '94105-1234', true],
    ['GB', '12345', false],
  ])('validates %s postal code %s', (country, postalCode, valid) => {
    expect(issues({ country, postalCode }).postalCode).toBe(
      valid ? undefined : 'validation.postalCode',
    );
  });
});
