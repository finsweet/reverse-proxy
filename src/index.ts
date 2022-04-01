import { Router, compose } from 'worktop';
import { start } from 'worktop/cfw';
import * as Cache from 'worktop/cfw.cache';
import type { Context } from './context';

import { handler } from './main';
import { testing } from './testing';

const API = new Router<Context>();

API.prepare = compose(
  (_, context) => {
    context.timestamp = Date.now();

    context.defer((res) => {
      const ms = Date.now() - context.timestamp;
      res.headers.set('x-response-time', ms);
    });
  },

  Cache.sync()
);

API.add('GET', '/', handler);

API.add('GET', '/testing', testing);
API.add('GET', '/testing/*', testing);
API.add('GET', '/testing/:path1', testing);
API.add('GET', '/testing/:path1/*', testing);

API.add('GET', '/:path1', handler);
API.add('GET', '/:path1/*', handler);

export default start(API.run);
