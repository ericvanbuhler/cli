import { createLeaf, TerseError } from '@alwaysai/alwayscli';

import { appConfigFile } from '../../../app-config-file';
import { targetConfigFile } from './target-config-file';
import { VENV } from '../../../app-installer';
import { spawnerBase } from '../../../spawner/spawner-base';
import { join } from 'path';

export const appTargetStart = createLeaf({
  name: 'start',
  options: {},
  description: 'Run this application "start" script on the target',
  action() {
    const appConfig = appConfigFile.read();
    const script = appConfig.scripts && appConfig.scripts.start;
    if (!script) {
      throw new TerseError('This application does not define a "start" script');
    }
    const spawner = targetConfigFile.readSpawner();
    const targetConfig = targetConfigFile.read();

    switch (targetConfig.protocol) {
      case 'docker:': {
        spawner.runForeground({
          exe: '/bin/bash',
          args: ['-t', '-c', `. ${join(VENV, 'bin', 'activate')} && ${script}`],
          tty: true,
          cwd: '.',
        });
        return;
      }

      // This case differs from "docker:"" only in the extra single quotes around the command
      case 'ssh+docker:': {
        spawner.runForeground({
          exe: '/bin/bash',
          args: ['-t', '-c', `'. ${join(VENV, 'bin', 'activate')} && ${script}'`],
          tty: true,
          cwd: '.',
        });
        return;
      }

      case 'ssh:': {
        const command = `cd ${spawner.abs()} && . ${join(
          VENV,
          'bin',
          'activate',
        )} && ${script}`;

        spawnerBase.runForeground({
          exe: 'ssh',
          args: ['-t', targetConfig.hostname, command],
        });
        return;
      }

      default: {
        throw new Error('Unsupported protocol');
      }
    }
  },
});
