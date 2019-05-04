import { createBranch } from '@alwaysai/alwayscli';
import { list } from './list';

export const models = createBranch({
  name: 'models',
  description: 'Create, search, or manage alwaysAI models',
  subcommands: [list],
});
