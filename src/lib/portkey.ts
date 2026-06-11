import Portkey from 'portkey-ai';

function getPortkeyInstance() {
  if (!process.env.PORTKEY_API_KEY) {
    throw new Error('PORTKEY_API_KEY environment variable is required');
  }

  if (!process.env.PORTKEY_VIRTUAL_KEY) {
    throw new Error('PORTKEY_VIRTUAL_KEY environment variable is required');
  }

  return new Portkey({
    apiKey: process.env.PORTKEY_API_KEY,
    virtualKey: process.env.PORTKEY_VIRTUAL_KEY,
  });
}

let portkeyInstance: Portkey | null = null;

export const portkey = new Proxy({} as Portkey, {
  get(target, prop) {
    if (!portkeyInstance) {
      portkeyInstance = getPortkeyInstance();
    }
    return (portkeyInstance as any)[prop];
  },
});
