import { Router } from 'worktop';
import { listen } from 'worktop/cache';
import * as Requrl from './routes';

const API = new Router();

/**
 * NOTE: Demo expects hard-coded ":username" value.
 */

API.add('GET', '/', Requrl.test);
// API.add('GET', '/:path1/:path2', Requrl.index);
// API.add('GET', '/:path1/:path2/*', Requrl.index);
// API.add('GET', '/:path1', Requrl.index);

listen(API.run);
