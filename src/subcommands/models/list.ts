import { createLeaf } from '@alwaysai/alwayscli';

import { ModelId } from '../../model-id';
import { createRpcClient } from '../../create-rpc-client';

export const list = createLeaf({
  name: 'list',
  description: 'List alwaysAI models',
  async action() {
    const rpcClient = createRpcClient();
    const models = await rpcClient.listModelVersions();
    return models.map(model => ModelId.serialize(model)).join('\n');
  },
});
