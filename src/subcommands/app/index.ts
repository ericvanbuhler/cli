import { createBranch } from '@alwaysai/always-cli';
import { init } from './init';
import { show } from './show';
import { models } from './models';
import { target } from './target';

export const app = createBranch({
  name: 'app',
  description: 'Create or manage an alwaysAI application',
  subcommands: [init, target, show, models],
});
