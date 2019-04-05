import { createBranch } from '@alwaysai/always-cli';
import { init } from './init';
import { shell } from './shell';
import { start } from './start';
import { show } from './show';
import { deploy } from './deploy';
import { exec } from './exec';

export const dev = createBranch({
  name: 'dev',
  description: 'alwaysAI app developer tools',
  hidden: true,
  subcommands: [init, show, shell, exec, deploy, start],
});
// v4l2-ctl --list-devices
