import { createBranch } from '@alwaysai/always-cli';
import { list } from './list';

export const models = createBranch({
  commandName: 'models',
  description: 'Tools for managing an alwaysAI app',
  subcommands: [list],
});
