import { createLeaf } from '@alwaysai/always-cli';
import { devConfigFile } from './dev-config-file';
import { SandboxUrl } from '../../../sandbox-url';
import { SshClient } from '../../../ssh-client';

export const shell = createLeaf({
  name: 'shell',
  description: 'Run a shell in the remote sandbox',
  options: {},
  async action() {
    const devConfig = devConfigFile.read();
    const sandboxUrl = SandboxUrl.parse(devConfig.sandboxUrl);
    const sshClient = new SshClient(sandboxUrl);
    await sshClient.connect();
    await sshClient.mkdirp(sandboxUrl.pathname);
    await sshClient.shell({ cwd: sandboxUrl.pathname });
  },
});
