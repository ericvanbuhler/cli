import { createLeaf, TerseError } from '@alwaysai/always-cli';
import { devConfigFile } from './dev-config-file';
import { SandboxUrl } from '../../../sandbox-url';
import { SshClient } from '../../../ssh-client';
import { appConfigFile } from '../../../app-config-file';

export const start = createLeaf({
  name: 'start',
  description: 'Run the application "start" script in the dev sandbox',
  options: {},
  async action() {
    const devConfig = devConfigFile.read();
    const appConfig = appConfigFile.read();
    const script = appConfig.scripts && appConfig.scripts.start;
    if (!script) {
      throw new TerseError('This application does not define a "start" script');
    }
    const sandboxUrl = SandboxUrl.parse(devConfig.sandboxUrl);
    const sshClient = new SshClient(sandboxUrl);
    await sshClient.connect();
    await sshClient.runCommand2(`cd "${sandboxUrl.pathname}" && DISPLAY=:1 ${script}`);
  },
});
