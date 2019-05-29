import { createLeaf } from '@alwaysai/alwayscli';
import { targetConfigFile } from './target-config-file';
import { VENV } from '../../../app-installer';

export const shell = createLeaf({
  name: 'shell',
  description: 'Run a shell in the target environment',
  action() {
    const target = targetConfigFile.readSpawner();
    const targetConfig = targetConfigFile.read();
    const rcfile = `${target.abs(VENV, 'bin', 'activate')}`;
    switch (targetConfig.protocol) {
      case 'docker:': {
        target.runForeground({
          exe: '/bin/bash',
          args: ['--rcfile', rcfile],
          tty: true,
          cwd: '.',
        });
        break;
      }

      case 'ssh:': {
        target.runForeground({
          exe: `cd "${target.abs()}"; /bin/bash --rcfile ${rcfile}`,
          tty: true,
        });
        break;
      }

      case 'ssh+docker:': {
        target.runForeground({
          exe: '/bin/bash',
          args: ['--rcfile', rcfile],
          tty: true,
          cwd: '.',
        });
        break;
      }

      default: {
        throw new Error('Unsupported protocol');
      }
    }
  },
});
