import { createLeaf, createJsonInput, createBranch } from '@alwaysai/alwayscli';
import { rpcMethodSpecs } from '@alwaysai/cloud-api';
import { createRpcClient } from '../create-rpc-client';

const subcommands = Object.entries(rpcMethodSpecs).map(
  ([methodName, { description }]) => {
    return createLeaf({
      name: methodName,
      description,
      options: {
        args: createJsonInput({ description: 'Arguments as JSON array string' }),
      },
      async action(_, { args }) {
        const rpcClient = createRpcClient();
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
