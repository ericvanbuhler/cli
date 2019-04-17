import { createBranch } from '@alwaysai/always-cli';
import { init } from './init';
import { show } from './show';
import { models } from './models';
import { deploy } from './deploy';
import { dev } from './dev';

export const app = createBranch({
  name: 'app',
  description: 'Create or manage an alwaysAI application',
  subcommands: [init, dev, deploy, show, models],
});
