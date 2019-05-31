import { createLeaf } from '@alwaysai/alwayscli';
import { RpcClient } from '../../../rpc-client';

export const searchModels = createLeaf({
  name: 'search',
  description: 'Search alwaysAI models',
  async action() {
    const rpcClient = await RpcClient();
    const modelVersions = await rpcClient.listModelVersions();
    const uniqueIds = [...new Set(modelVersions.map(({ id }) => id))];
    return uniqueIds.join('\n');
  },
});
