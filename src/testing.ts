import type { Handler } from './context';
import { reply } from 'worktop/response';

/**
 * Testing Reverse Proxy Handler
 * @param request
 * @param context
 */
export const testing: Handler = async (request, context) => {
  const {
    params: { path1, wild },
    url: { hostname, search },
  } = context;

  const fullPath = buildPath(path1, wild, search);

  const response = await fetch('https://wf.finsweet.com/2020');

  if (response.redirected && response.url) {
    return reply(301, {}, { location: response.url });
  }

  return response;
};

/**
 * Concatenates the path1 + the wildcard value
 * @param path1
 * @param wild
 * @returns The concatenated path
 */
const buildPath = (path1?: string, wild?: string, search?: string) => {
  let path = '';

  if (path1) path += `${path1}/`;
  if (wild) path += `${wild}/`;
  if (search) path += `${search}`;

  return path;
};
