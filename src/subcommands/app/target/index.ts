import { createBranch } from '@alwaysai/alwayscli';
import { init } from './init';
import { shell } from './shell';
import { appTargetStart } from './start';
import { show } from './show';
import { exec } from './exec';
import { install } from './install';

export const target = createBranch({
  name: 'target',
  description: 'Tools for developing with a remote target',
  subcommands: [init, show, shell, exec, install, appTargetStart],
});
