import { createLeaf, TerseError } from '@alwaysai/alwayscli';

import { appConfigFile } from '../../../app-config-file';
import { targetConfigFile } from './target-config-file';

export const start = createLeaf({
  name: 'start',
  description: 'Run the application "start" script in the dev target',
  options: {},
  action() {
    const appConfig = appConfigFile.read();
    const script = appConfig.scripts && appConfig.scripts.start;
    if (!script) {
      throw new TerseError('This application does not define a "start" script');
    }
    const [exe, ...args] = script.split(' ');
    const spawner = targetConfigFile.readSpawner();
    let fullExe = exe;
    if (fullExe === 'python' || fullExe === 'python3') {
      fullExe = `venv/bin/${fullExe}`;
    }
    spawner.runForeground({ exe, args, cwd: spawner.abs() });
  },
});
