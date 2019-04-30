import { createBranch } from '@alwaysai/always-cli';
import { init } from './init';
import { publish } from './publish';

export const model = createBranch({
  name: 'model',
  hidden: true,
  description: 'Log in or log out of the alwaysAI cloud',
  subcommands: [init, publish],
});
