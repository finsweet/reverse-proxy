type Env = {
  DOMAIN: string;
  WEBFLOW_SUBDOMAIN: string;
  SUBDOMAINS: string;
};

export type Context = {
  Bindings: Env;
};
