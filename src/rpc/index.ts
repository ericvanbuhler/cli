import {
  createLeaf,
  withRequired,
  createStringOption,
  createJsonOption,
} from '@alwaysai/always-cli';
import { createRpc } from './create-rpc';

const methodName = withRequired(
  createStringOption({
    description: 'Name of a method to call',
  }),
);

const args = createJsonOption({
  description: 'Name of a method to call',
});

export const rpc = createLeaf({
  commandName: 'rpc',
  description: 'Remote procedure call (RPC)',
  options: {
    methodName,
    args,
  },
  async action({ methodName, args }) {
    const rpc = createRpc({
      protocol: 'https',
      hostname: 'alwaysai-dev.appspot.com',
      port: 443,
      username: 'TODO',
      password: 'also TODO',
    });
    const result = await rpc(methodName, args);
    return result;
  },
});
