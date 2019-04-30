import { createLeaf } from '@alwaysai/always-cli';

import { modelConfigFile } from './model-config-file';
import { createRpcClient } from '../../create-rpc-client';

export const publish = createLeaf({
  name: 'publish',
  description: 'Publish a new version of a model to the alwaysAI cloud',
  async action() {
    const config = modelConfigFile.read();
    const rpcClient = createRpcClient();
    await rpcClient.createModelVersion(config);
  },
});
