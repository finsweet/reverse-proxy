import { extractCommaSeparatedValues } from '@finsweet/ts-utils';
import type { Handler } from 'worktop';

// Types
declare const DOMAIN: string;
declare const MAIN_SUBDOMAIN: string;
declare const WEBFLOW_SUBDOMAIN: string;
declare const SUBDOMAINS: string;

// Constants
const subdomains = extractCommaSeparatedValues(SUBDOMAINS);

/**
 * Main Reverse Proxy Handler
 * @param req
 * @param res
 */
export const handler: Handler = async (req, res) => {
  const {
    hostname,
    params: { path1, wild },
    search,
  } = req;

  // Build the full path
  const fullPath = buildPath(path1, wild, search);

  if (hostname !== `${MAIN_SUBDOMAIN}.${DOMAIN}`) {
    // Check if the request is made to any proxied SUBDOMAIN.finsweet.com
    const subdomain = subdomains.find((subdomain) => hostname.startsWith(subdomain));

    if (subdomain) res.send(301, {}, { Location: `https://${MAIN_SUBDOMAIN}.${DOMAIN}/${subdomain}/${fullPath}` });
    // If not, make sure the hostname points to the main subdomain
    else res.send(301, {}, { Location: `https://${MAIN_SUBDOMAIN}.${DOMAIN}/${fullPath}` });

    return;
  }

  // If the path1 belongs to a proxied SUBDOMAIN.finsweet.com, fetch the data from it
  if (path1 && subdomains.includes(path1)) {
    return fetch(`https://${path1}.${DOMAIN}/${buildPath(undefined, wild, search)}`);
  }

  // If no conditions are met, just return the requested path
  const response = await fetch(`https://${WEBFLOW_SUBDOMAIN}.${DOMAIN}/${fullPath}`);

  if (response.redirected && response.url && !response.url.includes(`${WEBFLOW_SUBDOMAIN}.${DOMAIN}`)) {
    res.send(301, {}, { location: response.url });
    return;
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
