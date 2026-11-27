export function isPreviewBuild(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const branch = env.WORKERS_CI_BRANCH;
  return env.WORKERS_CI === '1' && Boolean(branch) && branch !== 'main';
}

export function buildCanonicalUrl(
  pathname: string,
  site: URL | string,
): string {
  const base = new URL(site);
  const url = new URL(base.origin);
  url.pathname = pathname;
  return url.toString();
}

export function buildRobotsTxt(isPreview: boolean, site: URL | string): string {
  if (isPreview) {
    return 'User-agent: *\nDisallow: /\n';
  }
  const origin = new URL(site).origin;
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap-index.xml\n`;
}
