import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildCanonicalUrl, buildRobotsTxt, isPreviewBuild } from './site-env';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('isPreviewBuild', () => {
  it('returns true for non-main branch under Workers CI', () => {
    expect(
      isPreviewBuild({
        WORKERS_CI: '1',
        WORKERS_CI_BRANCH: 'feat/initial-site',
      }),
    ).toBe(true);
  });

  it('returns false for main branch, missing branch, or non-CI builds', () => {
    expect(
      isPreviewBuild({
        WORKERS_CI: '1',
        WORKERS_CI_BRANCH: 'main',
      }),
    ).toBe(false);
    expect(
      isPreviewBuild({
        WORKERS_CI: '1',
        WORKERS_CI_BRANCH: '',
      }),
    ).toBe(false);
    expect(
      isPreviewBuild({
        WORKERS_CI: '1',
      }),
    ).toBe(false);
    expect(
      isPreviewBuild({
        WORKERS_CI: '0',
        WORKERS_CI_BRANCH: 'feat/preview',
      }),
    ).toBe(false);
    expect(
      isPreviewBuild({
        WORKERS_CI_BRANCH: 'feat/preview',
      }),
    ).toBe(false);
    expect(isPreviewBuild({})).toBe(false);
  });

  it('reads from process.env when env argument is omitted', () => {
    vi.stubEnv('WORKERS_CI', '1');
    vi.stubEnv('WORKERS_CI_BRANCH', 'pr-42');
    expect(isPreviewBuild()).toBe(true);

    vi.stubEnv('WORKERS_CI_BRANCH', 'main');
    expect(isPreviewBuild()).toBe(false);
  });
});

describe('buildCanonicalUrl', () => {
  it('combines pathname and site origin for strings and URL objects', () => {
    expect(
      buildCanonicalUrl('/', 'https://e2e-learn.rymetry.workers.dev'),
    ).toBe('https://e2e-learn.rymetry.workers.dev/');
    expect(
      buildCanonicalUrl(
        '/chapters/01-setup-and-first-run/',
        new URL('https://e2e-learn.rymetry.workers.dev/'),
      ),
    ).toBe(
      'https://e2e-learn.rymetry.workers.dev/chapters/01-setup-and-first-run/',
    );
  });

  it('normalizes missing leading slash and ignores site subpath', () => {
    expect(
      buildCanonicalUrl('setup/', 'https://example.com/ignored/subpath'),
    ).toBe('https://example.com/setup/');
  });

  it('does not allow protocol-relative pathnames to escape origin', () => {
    expect(
      buildCanonicalUrl(
        '//evil.example/phish',
        'https://e2e-learn.rymetry.workers.dev',
      ),
    ).toBe('https://e2e-learn.rymetry.workers.dev//evil.example/phish');
  });
});

describe('buildRobotsTxt', () => {
  it('blocks indexing on preview builds', () => {
    expect(
      buildRobotsTxt(true, 'https://preview.e2e-learn.rymetry.workers.dev'),
    ).toBe('User-agent: *\nDisallow: /\n');
  });

  it('allows indexing and includes sitemap URL on production builds', () => {
    expect(buildRobotsTxt(false, 'https://e2e-learn.rymetry.workers.dev')).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://e2e-learn.rymetry.workers.dev/sitemap-index.xml\n',
    );
    expect(
      buildRobotsTxt(
        false,
        new URL('https://e2e-learn.rymetry.workers.dev/nested/'),
      ),
    ).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://e2e-learn.rymetry.workers.dev/sitemap-index.xml\n',
    );
  });
});
