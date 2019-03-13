import { createBranch } from '@alwaysai/always-cli';
import { project } from './project';
import { user } from './user';
import { version } from './version';

export const alwaysai = createBranch({
  commandName: 'alwaysai',
  description: 'Manage your alwaysAI assets and environment',
  subcommands: [project, user, version],
});
