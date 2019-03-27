import { createBranch } from '@alwaysai/always-cli';
import { init } from './init';
import { show } from './show';
import { models } from './models';
import { deploy } from './deploy';

export const app = createBranch({
  commandName: 'app',
  description: 'Tools for managing an alwaysAI app',
  subcommands: [init, deploy, show, models],
});
