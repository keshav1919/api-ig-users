/**
 * Dynamic API configuration.
 *
 * Automatically fetches the active Cloudflare Tunnel URL from a live GitHub Gist,
 * so restarting services or the server never breaks the Netlify website.
 */

const GIST_API_URL = 'https://api.github.com/gists/da0d9dfca2f184444f8ea9b1f4d9e220';

export let API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://legendtech.store';

/**
 * Returns the custom domain API URL directly.
 */
export async function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return API_BASE_URL;
}

/**
 * Returns the full avatar proxy URL for a given raw image URL.
 */
export const getAvatarProxyUrl = async (rawUrl) => {
  if (!rawUrl) return null;
  const baseUrl = await getApiBaseUrl();
  return `${baseUrl}/api/avatar-proxy?url=${encodeURIComponent(rawUrl)}`;
};
