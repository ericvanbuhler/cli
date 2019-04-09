import { createLeaf } from '@alwaysai/always-cli';

import { SandboxUrl } from '../../sandbox-url';
import { createTarbombStream } from '../../create-tarbomb-stream';
import { SshClient } from '../../ssh-client';
import { appConfigFile } from '../../app-config-file';
import { devConfigFile } from './dev-config-file';

export const deploy = createLeaf({
  name: 'deploy',
  description: 'Deploy this alwaysAI application to the development sandbox',
  options: {},
  async action() {
    appConfigFile.read();
    const devConfig = devConfigFile.read();
    const sandboxUrl = SandboxUrl.parse(devConfig.sandboxUrl);
    const sshClient = new SshClient(sandboxUrl);
    await sshClient.connect();
    const packageStream = createTarbombStream(process.cwd());
    return await sshClient.unPackage(sandboxUrl.pathname, packageStream);
  },
});
