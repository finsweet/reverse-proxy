import { Router } from 'worktop';
import { listen } from 'worktop/cache';
import { handler } from './routes';
import { testing } from './testing';

const API = new Router();

API.add('GET', '/', handler);

API.add('GET', '/testing', testing);
API.add('GET', '/testing/*', testing);
API.add('GET', '/testing/:path1', testing);
API.add('GET', '/testing/:path1/*', testing);

API.add('GET', '/:path1', handler);
API.add('GET', '/:path1/*', handler);

listen(API.run);
