type Env = {
  DOMAIN: string;
  WEBFLOW_SUBDOMAIN: string;
  SUBDOMAINS: string;
  MAINTENANCE_HREF?: string;
};

export type Context = {
  Bindings: Env;
};
