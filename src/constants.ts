import { env } from 'cloudflare:workers';

export const MAINTENANCE_SCREEN = 'https://finsweet-maintenance.webflow.io/';

export const MAIN_ORIGIN = `https://${env.DOMAIN}`;

/**
 * The reverse proxied subdomains, split into Arrays that define the sub-subdomain levels
 * and sorted from more specific to lesser.
 *
 * @example
 * "attributes, attributes.combos, cookie-consent, foo.bar.baz" =>
 * [
 *   ["foo", "bar", "baz"],
 *   ["attributes", "combos"],
 *   ["attributes"],
 *   ["cookie-consent"]
 * ]
 */
export const SUBDOMAINS_DATA = (() => {
  const data = env.SUBDOMAINS.split(',').reduce<Array<string[]>>((acc, value) => {
    if (!value) return acc;

    const subdomains = value.trim().split('.');

    acc.push(subdomains);

    return acc;
  }, []);

  data.sort((a, b) => b.length - a.length);

  return data;
})();
