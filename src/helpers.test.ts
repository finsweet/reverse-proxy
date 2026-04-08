import { describe, expect, test } from 'vitest';

import { build_url, has_trailing_slash, path_to_subdomain, subdomain_to_path } from './helpers';

describe('build_url', () => {
  test('builds a URL from paths and search', () => {
    const url = build_url('https://example.com', ['foo', 'bar'], '?baz=qux');

    expect(url.href).toBe('https://example.com/foo/bar?baz=qux');
  });

  test('removes empty path segments and preserves origin', () => {
    const url = build_url('https://example.com/base', ['', 'foo', '', 'bar'], '');

    expect(url.href).toBe('https://example.com/foo/bar');
  });
});

describe('has_trailing_slash', () => {
  test('returns true for trailing slashes', () => {
    expect(has_trailing_slash('/foo/')).toBe(true);
    expect(has_trailing_slash('/foo//')).toBe(true);
  });

  test('returns false when there is no trailing slash', () => {
    expect(has_trailing_slash('/foo')).toBe(false);
  });
});

describe('subdomain_to_path', () => {
  test('maps the main webflow subdomain to the root path', () => {
    expect(subdomain_to_path('wf.finsweet.com')).toEqual([]);
  });

  test('prefers the most specific configured subdomain', () => {
    expect(subdomain_to_path('components.changelog.finsweet.com')).toEqual([
      'components',
      'changelog',
    ]);
  });

  test('matches a single-level configured subdomain', () => {
    expect(subdomain_to_path('attributes.finsweet.com')).toEqual(['attributes']);
  });

  test('returns undefined when hostname is not configured', () => {
    expect(subdomain_to_path('random.finsweet.com')).toBeUndefined();
  });
});

describe('path_to_subdomain', () => {
  test('matches the most specific configured subdomain and keeps wildcard paths', () => {
    expect(path_to_subdomain(['components', 'changelog', 'releases'])).toEqual({
      subdomain: 'components.changelog',
      wildcard_paths: ['releases'],
    });
  });

  test('matches a single-level configured subdomain and keeps wildcard paths', () => {
    expect(path_to_subdomain(['attributes', 'docs'])).toEqual({
      subdomain: 'attributes',
      wildcard_paths: ['docs'],
    });
  });

  test('falls back to the main webflow subdomain when path is not configured', () => {
    expect(path_to_subdomain(['random'])).toEqual({
      subdomain: 'wf',
      wildcard_paths: ['random'],
    });
  });
});
