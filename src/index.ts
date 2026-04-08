import { type Context, Hono } from 'hono';

import { MAIN_ORIGIN, MAINTENANCE_SCREEN } from './constants';
import { build_url, has_trailing_slash, path_to_subdomain, subdomain_to_path } from './helpers';
import { rewrite_sitemap_locs } from './sitemaps';

const app = new Hono<{ Bindings: Cloudflare.Env }>();

app.use('*', async (c) => {
  const { DOMAIN, WEBFLOW_SUBDOMAIN, MAINTENANCE_HREF } = c.env;
  const { origin, hostname, pathname, search, href } = new URL(c.req.url);

  const is_under_maintenance = MAINTENANCE_HREF && href.startsWith(MAINTENANCE_HREF);
  if (is_under_maintenance) {
    return fetch(MAINTENANCE_SCREEN);
  }

  const paths = pathname.split('/').filter(Boolean);

  // Handle when hostname has a subdomain
  if (hostname !== DOMAIN) {
    // Subdomain is reverse proxied
    const match = subdomain_to_path(hostname);
    if (match) {
      const redirect_url = build_url(MAIN_ORIGIN, [...match, ...paths], search);

      return c.redirect(redirect_url, 301);
    }

    // Subdomain is the main Webflow project
    if (hostname.startsWith(`${WEBFLOW_SUBDOMAIN}.`)) {
      const redirect_url = build_url(MAIN_ORIGIN, paths, search);

      return c.redirect(redirect_url, 301);
    }

    // Subdomain is not reverse proxied
    return fetch(c.req.raw);
  }

  // Handle trailing slashes
  if (paths.length && has_trailing_slash(pathname)) {
    const redirect_url = build_url(origin, paths, search);

    return c.redirect(redirect_url, 301);
  }

  // Path matches reverse proxied subdomain
  const match = path_to_subdomain(paths);
  if (match) {
    const { subdomain, wildcard_paths } = match;

    const target_origin = `https://${subdomain}.${DOMAIN}`;
    const target_url = build_url(target_origin, wildcard_paths, search);

    return fetch_resource(c, target_url);
  }

  // If no subdomains are matched, fetch from the main Webflow project
  const webflow_origin = `https://${WEBFLOW_SUBDOMAIN}.${DOMAIN}`;
  const target_url = build_url(webflow_origin, paths, search);

  return fetch_resource(c, target_url);
});

/**
 * Fetches a resource from the target URL and handles specific response transformations.
 * @param c
 * @param target_url
 */
const fetch_resource = async (c: Context, target_url: URL) => {
  const response = await fetch(target_url);

  if (response.redirected && response.url) {
    return c.redirect(response.url, 301);
  }

  if (target_url.pathname.endsWith('/sitemap.xml')) {
    return rewrite_sitemap_locs(response);
  }

  return response;
};

export default app;
