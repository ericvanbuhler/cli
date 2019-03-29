#!/usr/bin/env node

import { createBranch, createCli, runAndExit } from '@alwaysai/always-cli';

import { app } from './app';
import { version } from './version';
import { models } from './models';
import { user } from './user';
import { rpc } from './rpc';

const root = createBranch({
  commandName: 'alwaysai',
  description: 'Manage your alwaysAI assets and environment',
  subcommands: [app, user, models, rpc, version],
});

export const alwaysai = createCli(root);

if (module === require.main) {
  runAndExit(alwaysai, ...process.argv.slice(2));
}
