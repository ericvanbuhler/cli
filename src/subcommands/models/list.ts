import { createLeaf } from '@alwaysai/alwayscli';

import { createRpcClient } from '../../create-rpc-client';

export const list = createLeaf({
  name: 'list',
  description: 'List alwaysAI models',
  async action() {
    const rpcClient = createRpcClient();
    const modelVersions = await rpcClient.listModelVersions();
    const uniqueIds = [...new Set(modelVersions.map(({ id }) => id))];
    return uniqueIds.join('\n');
  },
});
