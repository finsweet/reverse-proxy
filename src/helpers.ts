import { env } from 'cloudflare:workers';

import { SUBDOMAINS_DATA } from './constants';

/**
 * Builds a new URL from an array of paths or nested paths.
 * @param paths
 * @param search
 */
export const build_url = (origin: string, paths: string[], search: string) => {
  const url = new URL(origin);

  url.pathname = '/' + paths.flat().filter(Boolean).join('/');
  url.search = search;

  return url;
};

/**
 * Checks if a URL has a trailing slash.
 * @param pathname
 */
export const has_trailing_slash = (pathname: string) => /\/+$/.test(pathname);

/**
 * Tries to match a hostname to a reverse proxied subdomain.
 * If the hostname is the webflow subdomain, it returns an empty array to indicate that the request should be proxied to the root of the main Webflow project.
 *
 * @param hostname
 * @returns An array with the paths that correspond to the reverse proxied subdomain.
 *
 * @example
 * "attributes.finsweet.com" => ["attributes"]
 * "attributes.combos.finsweet.com" => ["attributes", "combos"]
 * "random.finsweet.com" => undefined
 * "wf.finsweet.com" => []
 */
export const subdomain_to_path = (hostname: string) => {
  if (hostname.startsWith(`${env.WEBFLOW_SUBDOMAIN}.`)) {
    return [];
  }

  const match = SUBDOMAINS_DATA.find((sub_subdomains) => {
    const subdomain = sub_subdomains.join('.');

    return hostname.startsWith(`${subdomain}.`);
  });

  return match;
};

/**
 * Tries to match an array of paths to a reverse proxied subdomain.
 * If no subdomain is matched, it returns the main Webflow subdomain with all paths as wildcard paths.
 * @param paths
 *
 * @returns The matched subdomain and the wildcard paths
 *
 * @example
 * ["attributes"] => { subdomain: "attributes", wildcard_paths: [] }
 * ["attributes", "random"] => { subdomain: "attributes", wildcard_paths: ["random"] }
 * ["attributes", "combos"] => { subdomain: "attributes.combos", wildcard_paths: [] }
 * ["attributes", "combos", "random"] => { subdomain: "attributes.combos", wildcard_paths: ["random"] }
 * ["random"] => { subdomain: env.WEBFLOW_SUBDOMAIN, wildcard_paths: ["random"] }
 */
export const path_to_subdomain = (paths: string[]) => {
  const match = SUBDOMAINS_DATA.find((sub_subdomains) =>
    sub_subdomains.every((sub_subdomain, index) => paths[index] && sub_subdomain === paths[index])
  );

  if (match) {
    const subdomain = match.join('.');
    const wildcard_paths = paths.slice(match.length);

    return { subdomain, wildcard_paths };
  }

  // If no subdomains are matched, fetch from the main Webflow project
  return { subdomain: env.WEBFLOW_SUBDOMAIN, wildcard_paths: paths };
};
