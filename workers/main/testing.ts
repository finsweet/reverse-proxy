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

  res.send(200, JSON.stringify({ req, fullPath }));
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
