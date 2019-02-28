import { createBranch } from '@alwaysai/always-cli';
import { user } from './user';

export const root = createBranch({
  commandName: 'alwaysai',
  description: 'Manage your alwaysAI environment',
  subcommands: [user],
});
