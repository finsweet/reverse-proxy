import { env } from 'cloudflare:workers';

import { MAIN_ORIGIN } from './constants';
import { build_url, subdomain_to_path } from './helpers';

class LocTextHandler implements HTMLRewriterElementContentHandlers {
  #buffer = '';

  text(text: Text) {
    this.#buffer += text.text;

    if (!text.lastInTextNode) {
      text.replace('');

      return;
    }

    const rewritten = rewrite_loc_value(this.#buffer.trim());

    this.#buffer = '';
    text.replace(rewritten);
  }
}

/**
 * Rewrites <loc> values in sitemaps if they belong to a subdomain.
 * @param response
 */
export const rewrite_sitemap_locs = async (response: Response) => {
  const content_type = response.headers.get('content-type') || '';
  if (!content_type.toLowerCase().includes('xml')) return response;

  const handler = new LocTextHandler();
  const transformed = new HTMLRewriter().on('loc', handler).transform(response);
  const transformed_body = await transformed.text();

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');

  return new Response(transformed_body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

/**
 * Rewrites a sitemap <loc> value if it belongs to a subdomain.
 * @param value
 */
const rewrite_loc_value = (value: string) => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return value;
  }

  const { hostname, pathname, search } = url;

  if (hostname === env.DOMAIN) return value;

  const match = subdomain_to_path(hostname);
  if (!match) return value;

  const paths = pathname.split('/').filter(Boolean);

  const new_url = build_url(MAIN_ORIGIN, [...match, ...paths], search);
  return new_url.toString();
};
