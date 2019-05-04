import { createLeaf, TerseError } from '@alwaysai/alwayscli';
import { targetConfigFile } from './target-config-file';
import { appConfigFile } from '../../../app-config-file';

export const start = createLeaf({
  name: 'start',
  description: 'Run the application "start" script in the dev target',
  options: {},
  async action() {
    const appConfig = appConfigFile.read();
    const script = appConfig.scripts && appConfig.scripts.start;
    if (!script) {
      throw new TerseError('This application does not define a "start" script');
    }
    const sshClient = await targetConfigFile.connectToTarget();
    await sshClient.runCommand2(`DISPLAY=:1 ${script}`);
  },
});
