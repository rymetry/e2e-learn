import type { APIRoute } from 'astro';
import { buildRobotsTxt, isPreviewBuild } from '../lib/site-env';

const DEFAULT_SITE = 'https://e2e-learn.rymetry.workers.dev';

export const GET: APIRoute = (context) => {
  const body = buildRobotsTxt(
    isPreviewBuild(process.env),
    context.site ?? DEFAULT_SITE,
  );
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
