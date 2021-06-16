import { Router } from 'worktop';
import { listen } from 'worktop/cache';
import { handler } from './routes';

const API = new Router();

API.add('GET', '/', handler);
API.add('GET', '/:path1', handler);
API.add('GET', '/:path1/*', handler);

listen(API.run);
