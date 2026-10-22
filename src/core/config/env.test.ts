import { parseEnv } from './env';

describe('parseEnv', () => {
  it('defaults to the mock backend and mock payments', () => {
    expect(parseEnv({}, false)).toEqual({
      backend: 'mock',
      apiUrl: undefined,
      paymentProvider: 'mock',
    });
  });

  it('requires HTTPS for the API', () => {
    expect(() => parseEnv({ backend: 'rest', apiUrl: 'http://api.example.com' }, false)).toThrow(
      'API URL must use HTTPS',
    );
    expect(parseEnv({ backend: 'rest', apiUrl: 'https://api.example.com' }, false).apiUrl).toBe(
      'https://api.example.com',
    );
  });

  it('allows plain HTTP to localhost only in development', () => {
    expect(parseEnv({ backend: 'rest', apiUrl: 'http://localhost:3000' }, true).backend).toBe(
      'rest',
    );
    expect(() => parseEnv({ backend: 'rest', apiUrl: 'http://localhost:3000' }, false)).toThrow();
  });

  it('requires an API URL for the REST backend', () => {
    expect(() => parseEnv({ backend: 'rest' }, false)).toThrow('EXPO_PUBLIC_API_URL is required');
  });
});
