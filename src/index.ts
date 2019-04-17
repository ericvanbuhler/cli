#!/usr/bin/env node

import { createBranch, createCli, runAndExit } from '@alwaysai/always-cli';
import { subcommands } from './subcommands';
import { CLI_NAME } from './constants';

const root = createBranch({
  name: CLI_NAME,
  description: 'Manage your alwaysAI assets and environment',
  subcommands,
});

export const alwaysai = createCli(root);

if (module === require.main) {
  runAndExit(alwaysai, ...process.argv.slice(2));
}
