import { createBranch } from '@alwaysai/alwayscli';
import { list } from './list';

export const models = createBranch({
  name: 'models',
  hidden: true,
  description: 'DEPRECATED please use "alwaysai app models search"',
  subcommands: [list],
});
