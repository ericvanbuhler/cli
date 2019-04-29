import { createBranch } from '@alwaysai/always-cli';
import { init } from './init';
import { shell } from './shell';
import { start } from './start';
import { show } from './show';
import { deploy } from './deploy';
import { exec } from './exec';

export const target = createBranch({
  name: 'target',
  description: 'Tools for developing with a remote target',
  subcommands: [init, show, shell, exec, deploy, start],
});
