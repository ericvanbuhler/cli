import { createBranch } from '@alwaysai/alwayscli';
import { init } from './init';
import { show } from './show';
import { models } from './models';
import { target } from './target';

export const app = createBranch({
  name: 'app',
  description: 'Develop an alwaysAI application',
  subcommands: [init, target, show, models],
});
