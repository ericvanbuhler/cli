#!/usr/bin/env node

import { createBranch, createCommandLineInterface } from '@alwaysai/always-cli';
import { project } from './project';
import { user } from './user';
import { version } from './version';
import { rpc } from './rpc';

export const alwaysai = createBranch({
  commandName: 'alwaysai',
  description: 'Manage your alwaysAI assets and environment',
  subcommands: [project, user, rpc, version],
});

if (module === require.main) {
  const commandLineInterface = createCommandLineInterface(alwaysai);
  commandLineInterface();
}
