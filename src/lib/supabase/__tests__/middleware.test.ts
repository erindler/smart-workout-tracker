import { getSafeRedirect } from '../middleware';

describe('getSafeRedirect (SC-005 open-redirect prevention)', () => {
  it('returns a valid relative path unchanged', () => {
    expect(getSafeRedirect('/dashboard')).toBe('/dashboard');
  });

  it('returns fallback for an external URL', () => {
    expect(getSafeRedirect('https://evil.com')).toBe('/');
  });

  it('returns fallback for a protocol-relative URL (//evil.com)', () => {
    expect(getSafeRedirect('//evil.com')).toBe('/');
  });

  it('returns fallback for an empty string', () => {
    expect(getSafeRedirect('')).toBe('/');
  });

  it('returns fallback for null', () => {
    expect(getSafeRedirect(null)).toBe('/');
  });

  it('uses a custom fallback when provided', () => {
    expect(getSafeRedirect('https://evil.com', '/home')).toBe('/home');
  });
});
