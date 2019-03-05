import { createLeaf } from '@alwaysai/always-cli';
import { WebApi } from '@alwaysai/web-api';

import { href } from './href';

export const ping = createLeaf({
  commandName: 'ping',
  description: 'Ping the alwaysAI Web API',
  options: {
    href,
  },
  async action({ href }) {
    const client = new WebApi(href);
    const data = await client.ping();
    return data;
  },
});
