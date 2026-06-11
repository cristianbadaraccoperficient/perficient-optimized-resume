import Portkey from 'portkey-ai';

if (!process.env.PORTKEY_API_KEY) {
  throw new Error('PORTKEY_API_KEY environment variable is required');
}

if (!process.env.PORTKEY_VIRTUAL_KEY) {
  throw new Error('PORTKEY_VIRTUAL_KEY environment variable is required');
}

export const portkey = new Portkey({
  apiKey: process.env.PORTKEY_API_KEY,
  virtualKey: process.env.PORTKEY_VIRTUAL_KEY,
});
