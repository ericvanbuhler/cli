import { createLeaf } from '@alwaysai/always-cli';
import { createRpcClient } from '@alwaysai/cloud-api-nodejs';

import { ModelId } from '../model-id';
import { cloudApi } from '../cloud-api';
import { credentialsStore } from '../credentials-store';

export const list = createLeaf({
  name: 'list',
  description: 'List alwaysAI models',
  options: {
    cloudApi,
  },
  async action(_, { cloudApi }) {
    const credentials = credentialsStore.read();
    const rpcClient = createRpcClient({ credentials, cloudApiUrl: cloudApi });
    const models = await rpcClient.listModels();
    return models.map(model => ModelId.serialize(model)).join('\n');
  },
});
