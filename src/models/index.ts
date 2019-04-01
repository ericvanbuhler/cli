import { createBranch } from '@alwaysai/always-cli';
import { list } from './list';

export const models = createBranch({
  commandName: 'models',
  description: 'Create, search, or manage alwaysAI models',
  subcommands: [list],
});
