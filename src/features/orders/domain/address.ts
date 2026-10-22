import { z } from 'zod';

export const COUNTRIES = ['DE', 'ES', 'FR', 'GB', 'NL', 'US'] as const;
export type Country = (typeof COUNTRIES)[number];

const POSTAL_CODE: Record<Country, RegExp> = {
  DE: /^\d{5}$/,
  ES: /^\d{5}$/,
  FR: /^\d{5}$/,
  GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
  NL: /^\d{4} ?[A-Z]{2}$/i,
  US: /^\d{5}(-\d{4})?$/,
};

export const AddressSchema = z
  .object({
    fullName: z.string().trim().min(2, 'validation.name').max(80, 'validation.tooLong'),
    email: z.string().trim().pipe(z.email('validation.email')),
    line1: z.string().trim().min(3, 'validation.required').max(120, 'validation.tooLong'),
    line2: z.string().trim().max(120, 'validation.tooLong'),
    city: z.string().trim().min(2, 'validation.required').max(80, 'validation.tooLong'),
    postalCode: z.string().trim().toUpperCase(),
    country: z.enum(COUNTRIES, 'validation.required'),
  })
  .superRefine((address, ctx) => {
    if (!POSTAL_CODE[address.country].test(address.postalCode)) {
      ctx.addIssue({ code: 'custom', path: ['postalCode'], message: 'validation.postalCode' });
    }
  });

export type AddressInput = z.input<typeof AddressSchema>;
export type Address = z.output<typeof AddressSchema>;

export const emptyAddress: AddressInput = {
  fullName: '',
  email: '',
  line1: '',
  line2: '',
  city: '',
  postalCode: '',
  country: 'DE',
};
