import type { Handler } from 'worktop';

// Constants

/**
 * Main Reverse Proxy Handler
 * @param req
 * @param res
 */
export const testing: Handler = async (req, res) => {
  const {
    hostname,
    params: { path1, wild },
    search,
  } = req;

  const fullPath = buildPath(path1, wild, search);

  const response = await fetch('https://wf.finsweet.com/2020');

  if (response.redirected && response.url) {
    res.send(301, {}, { location: response.url });
    return;
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
