import { extractCommaSeparatedValues } from '@finsweet/ts-utils';
import { reply } from 'worktop/response';
import type { Handler } from './context';

/**
 * Main Reverse Proxy Handler
 * @param request
 * @param context
 */
export const handler: Handler = async (request, context) => {
  const {
    params: { path1, wild },
    url: { hostname, search },
    bindings: { DOMAIN, MAIN_SUBDOMAIN, WEBFLOW_SUBDOMAIN, SUBDOMAINS },
  } = context;

  const subdomains = extractCommaSeparatedValues(SUBDOMAINS);
  const fullPath = buildPath(path1, wild, search);

  if (hostname !== `${MAIN_SUBDOMAIN}.${DOMAIN}`) {
    // Check if the request is made to any proxied SUBDOMAIN.finsweet.com
    const subdomain = subdomains.find((subdomain) => hostname.startsWith(subdomain));

    if (subdomain) return reply(301, {}, { Location: `https://${MAIN_SUBDOMAIN}.${DOMAIN}/${subdomain}/${fullPath}` });

    // If not, proceed with the original request
    return fetch(request);
  }

  // If the path1 belongs to a proxied SUBDOMAIN.finsweet.com, fetch the data from it
  if (path1 && subdomains.includes(path1)) {
    return fetch(`https://${path1}.${DOMAIN}/${buildPath(undefined, wild, search)}`);
  }

  // If no conditions are met, just return the requested path
  const response = await fetch(`https://${WEBFLOW_SUBDOMAIN}.${DOMAIN}/${fullPath}`);

  // Check for Webflow redirects
  if (response.redirected && response.url && !response.url.includes(`${WEBFLOW_SUBDOMAIN}.${DOMAIN}`)) {
    return reply(301, {}, { location: response.url });
  }

  return response;
};

/**
 * Concatenates the path1 + the wildcard value
 * @param path1
 * @param wild
 * @returns The concatenated path
 */
const buildPath = (path1?: string, wild?: string, search?: string) => {
  let path = '';

  if (path1) path += `${path1}/`;
  if (wild) path += `${wild}/`;
  if (search) path += `${search}`;

  return path;
};
