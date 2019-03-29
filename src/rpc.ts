import { createLeaf, createJsonOption, createBranch } from '@alwaysai/always-cli';
import { rpcMethodSpecs } from '@alwaysai/cloud-api';
import { CredentialsStore, createRpcClient } from '@alwaysai/cloud-api-nodejs';

import { cloudApiUrl } from './cloud-api-url';

const subcommands = Object.entries(rpcMethodSpecs).map(
  ([methodName, { description }]) => {
    return createLeaf({
      commandName: methodName,
      description,
      options: {
        args: createJsonOption({ description: 'Arguments as JSON array string' }),
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
  description: 'Invoke the alwaysAI remote procedure call (RPC) interface',
  subcommands,
});
