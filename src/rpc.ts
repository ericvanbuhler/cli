import { createLeaf, createJsonInput, createBranch } from '@alwaysai/always-cli';
import { rpcMethodSpecs } from '@alwaysai/cloud-api';
import { CredentialsStore, createRpcClient } from '@alwaysai/cloud-api-nodejs';

import { cloudApiUrl } from './cloud-api-url';

const subcommands = Object.entries(rpcMethodSpecs).map(
  ([methodName, { description }]) => {
    return createLeaf({
      commandName: methodName,
      description,
      namedInputs: {
        args: createJsonInput({ description: 'Arguments as JSON array string' }),
        href: cloudApiUrl,
      },
      async action({ args, href }) {
        const store = new CredentialsStore();
        const credentials = store.read();
        const rpcClient = createRpcClient({ cloudApiUrl: href, credentials });
        const method = (rpcClient as any)[methodName];
        const result = await method(...(args || []));
        return result;
      },
    });
  },
);

export const rpc = createBranch({
  commandName: 'rpc',
  description: 'Call the alwaysAI cloud API RPC interface',
  subcommands,
});
