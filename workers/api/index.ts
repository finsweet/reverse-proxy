import { Router } from 'worktop';
import { listen } from 'worktop/cache';
import { purgeCache } from './routes';

const API = new Router();

API.add('POST', '/purge-cache', purgeCache);

listen(API.run);
