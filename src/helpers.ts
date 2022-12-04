/**
 * Creates a URL origin from a hostname.
 * @param hostname
 */
export const create_origin = (hostname: string) => `https://${hostname}`;

/**
 * Builds a new URL from an array of paths or nested paths.
 * @param paths
 * @param search
 */
export const build_url = (paths: Array<string | string[]>, search: string) =>
  paths.flat().filter(Boolean).join('/') + search;

/**
 * Checks if a URL has a trailing slash.
 * @param pathname
 */
export const has_trailing_slash = (pathname: string) => /\/+$/.test(pathname);

export class Matcher {
  /**
   * The reverse proxied subdomains, split into Arrays that define the sub-subdomain levels
   * and sorted from more specific to lesser.
   */
  private subdomains_data;

  /**
   * URL Matcher service.
   * @param SUBDOMAINS The comma-separated SUBDOMAINS env variable.
   */
  constructor(SUBDOMAINS: string) {
    this.subdomains_data = get_subdomains_data(SUBDOMAINS);
  }

  /**
   * Tries to match a hostname to a reverse proxied subdomain.
   *
   * @param hostname
   * @returns An array with the paths that correspond to the reverse proxied subdomain.
   *
   * @example
   * "attributes.finsweet.com" => ["attributes"]
   * "attributes.combos.finsweet.com" => ["attributes", "combos"]
   * "random.finsweet.com" => undefined
   */
  public subdomain_to_path = (hostname: string) => {
    const match = this.subdomains_data.find((sub_subdomains) =>
      hostname.startsWith(sub_subdomains.join('.'))
    );

    return match;
  };

  /**
   * Tries to match an array of paths to a reverse proxied subdomain.
   * @param paths
   *
   * @returns The matched subdomain and the wildcard paths
   *
   * @example
   * ["attributes"] => { subdomain: "attributes", wildcard_paths: [] }
   * ["attributes", "random"] => { subdomain: "attributes", wildcard_paths: ["random"] }
   * ["attributes", "combos"] => { subdomain: "attributes.combos", wildcard_paths: [] }
   * ["attributes", "combos", "random"] => { subdomain: "attributes.combos", wildcard_paths: ["random"] }
   * ["random"] => undefined
   */
  public path_to_subdomain = (paths: string[]) => {
    const match = this.subdomains_data.find((sub_subdomains) =>
      sub_subdomains.every((sub_subdomain, index) => paths[index] && sub_subdomain === paths[index])
    );

    if (match) {
      const subdomain = match.join('.');
      const wildcard_paths = paths.slice(match.length);

      return { subdomain, wildcard_paths };
    }
  };
}

/**
 * @returns The reverse proxied subdomains, split into Arrays that define the sub-subdomain levels
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
const get_subdomains_data = (SUBDOMAINS: string) => {
  const subdomains_data = SUBDOMAINS.split(',').reduce<Array<string[]>>((acc, value) => {
    if (!value) return acc;

    const subdomains = value.trim().split('.');

    acc.push(subdomains);

    return acc;
  }, []);

  subdomains_data.sort((a, b) => b.length - a.length);

  return subdomains_data;
};
