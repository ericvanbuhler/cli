import { createBranch } from '@alwaysai/always-cli';
import { init } from './init';
import { show } from './show';
import { models } from './models';

export const app = createBranch({
  commandName: 'app',
  description: 'Manage an alwaysAI project',
  subcommands: [init, show, models],
});
