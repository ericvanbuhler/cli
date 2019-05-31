import { createLeaf } from '@alwaysai/alwayscli';

import { RpcClient } from '../../rpc-client';
import chalk from 'chalk';

export const list = createLeaf({
  name: 'list',
  description: 'List alwaysAI models',
  async action() {
    console.error(`${chalk.red('WARNING:')} This command is deprecated`);
    const rpcClient = await RpcClient();
    const modelVersions = await rpcClient.listModelVersions();
    const uniqueIds = [...new Set(modelVersions.map(({ id }) => id))];
    return uniqueIds.join('\n');
  },
});
