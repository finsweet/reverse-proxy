import { Hono } from 'hono';

import { MAINTENANCE_SCREEN } from './constants';
import type { Context } from './context';
import { build_url, create_origin, has_trailing_slash, Matcher } from './helpers';

const app = new Hono<Context>();

app.use('*', async (c) => {
  const { DOMAIN, WEBFLOW_SUBDOMAIN, SUBDOMAINS, MAINTENANCE_HREF } = c.env;
  const { origin, hostname, pathname, search, href } = new URL(c.req.url);

  const is_under_maintenance = MAINTENANCE_HREF && MAINTENANCE_HREF === href;
  if (is_under_maintenance) {
    return fetch(MAINTENANCE_SCREEN);
  }

  const main_origin = create_origin(DOMAIN);

  const paths = pathname.split('/').filter(Boolean);

  const matcher = new Matcher(SUBDOMAINS);

  // Handle when hostname has a subdomain
  if (hostname !== DOMAIN) {
    // Subdomain is reverse proxied
    const match = matcher.subdomain_to_path(hostname);
    if (match) {
      const redirect_url = build_url([main_origin, match, paths], search);

      return c.redirect(redirect_url, 301);
    }

    // Subdomain is the main Webflow project
    if (hostname.startsWith(WEBFLOW_SUBDOMAIN)) {
      const redirect_url = build_url([main_origin, paths], search);

      return c.redirect(redirect_url, 301);
    }

    // Subdomain is not reverse proxied
    return fetch(c.req.raw);
  }

  // Handle trailing slashes
  if (paths.length && has_trailing_slash(pathname)) {
    const redirect_url = build_url([origin, paths], search);

    return c.redirect(redirect_url, 301);
  }

  // Path matches reverse proxied subdomain
  const match = matcher.path_to_subdomain(paths);
  if (match) {
    const { subdomain, wildcard_paths } = match;

    const target_origin = create_origin(`${subdomain}.${DOMAIN}`);
    const target_url = build_url([target_origin, wildcard_paths], search);

    const response = await fetch(target_url);

    // Handle redirected responses
    if (response.redirected && response.url) {
      return c.redirect(response.url, 301);
    }

    return response;
  }

  // If no subdomains are matched, fetch from the main Webflow project
  const webflow_origin = create_origin(`${WEBFLOW_SUBDOMAIN}.${DOMAIN}`);
  const target_url = build_url([webflow_origin, paths], search);
  const response = await fetch(target_url);

  // Handle redirected responses
  if (response.redirected && response.url) {
    return c.redirect(response.url, 301);
  }

  return response;
});

export default app;
