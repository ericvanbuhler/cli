import { createLeaf } from '@alwaysai/always-cli';
import { createRpcClient, CredentialsStore } from '@alwaysai/cloud-api-nodejs';

import { ModelId } from '../model-id';
import { cloudApiUrl } from '../cloud-api-url';

export const list = createLeaf({
  commandName: 'list',
  description: 'List alwaysAI models',
  options: {
    cloudApiUrl,
  },
  async action({ cloudApiUrl }) {
    const store = new CredentialsStore();
    const credentials = store.read();
    const rpcClient = createRpcClient({ credentials, cloudApiUrl });
    const models = await rpcClient.listModels();
    return models.map(model => ModelId.serialize(model)).join('\n');
  },
});
