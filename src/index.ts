#!/usr/bin/env node

import { createBranch, createCommandLineInterface } from '@alwaysai/always-cli';
import { user, rpc } from '@alwaysai/cloud-api-cli';

import { app } from './app';
import { version } from './version';

export const alwaysai = createBranch({
  commandName: 'alwaysai',
  description: 'Manage your alwaysAI assets and environment',
  subcommands: [app, user, rpc, version],
});

if (module === require.main) {
  const commandLineInterface = createCommandLineInterface(alwaysai);
  commandLineInterface();
}
