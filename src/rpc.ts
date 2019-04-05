import { createLeaf, createJsonInput, createBranch } from '@alwaysai/always-cli';
import { rpcMethodSpecs } from '@alwaysai/cloud-api';
import { createRpcClient } from '@alwaysai/cloud-api-nodejs';

import { cloudApi } from './cloud-api';
import { credentialsStore } from './credentials-store';

const subcommands = Object.entries(rpcMethodSpecs).map(
  ([methodName, { description }]) => {
    return createLeaf({
      name: methodName,
      description,
      options: {
        args: createJsonInput({ description: 'Arguments as JSON array string' }),
        cloudApi,
      },
      async action(_, { args, cloudApi }) {
        const credentials = credentialsStore.read();
        const rpcClient = createRpcClient({ cloudApiUrl: cloudApi, credentials });
        const method = (rpcClient as any)[methodName];
        const result = await method(...(args || []));
        return result;
      },
    });
  },
);

export const rpc = createBranch({
  name: 'rpc',
  description: 'Call the alwaysAI cloud API RPC interface',
  subcommands,
});
