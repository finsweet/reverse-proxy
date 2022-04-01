import type * as worktop from 'worktop';

interface Params {
  path1: string;
}

export interface Context extends worktop.Context {
  timestamp: number;

  params: Params & worktop.Params;

  bindings: {
    SUBDOMAINS: string;
    DOMAIN: string;
    MAIN_SUBDOMAIN: string;
    WEBFLOW_SUBDOMAIN: string;
  };
}

export type Handler = worktop.Handler<Context>;
