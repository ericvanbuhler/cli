import { createLeaf } from '@alwaysai/always-cli';

import { ModelId } from '../../model-id';
import { createRpcClient } from '@alwaysai/cloud-api-nodejs';

export const list = createLeaf({
  name: 'list',
  description: 'List alwaysAI models',
  async action() {
    const rpcClient = createRpcClient();
    const models = await rpcClient.listModels();
    return models.map(model => ModelId.serialize(model)).join('\n');
  },
});
