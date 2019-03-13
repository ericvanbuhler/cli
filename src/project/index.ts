import { createBranch } from '@alwaysai/always-cli';
import { init } from './init';
import { show } from './show';
import { models } from './models';

export const project = createBranch({
  commandName: 'project',
  description: 'Manage an alwaysAI project',
  subcommands: [init, show, models],
});
