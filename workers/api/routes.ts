import type { Handler } from 'worktop';

// Types
declare const API_TOKEN: string;
declare const ZONE_ID: string;

export const purgeCache: Handler = async () => {
  return fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
    method: 'POST',
    body: JSON.stringify({
      purge_everything: true,
    }),
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
};
