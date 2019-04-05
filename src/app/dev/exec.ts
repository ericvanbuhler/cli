import { createLeaf, createStringArrayInput } from '@alwaysai/always-cli';
import { devConfigFile } from './dev-config-file';
import { SandboxUrl } from '../../sandbox-url';
import { SshClient } from '../../ssh-client';

export const exec = createLeaf({
  name: 'exec',
  description: 'Run a command in the remote sandbox directory',
  options: {},
  args: createStringArrayInput({
    placeholder: '<command> [<args>]',
    required: true,
  }),
  async action(args) {
    const devConfig = devConfigFile.read();
    const sandboxUrl = SandboxUrl.parse(devConfig.sandboxUrl);
    const sshClient = new SshClient(sandboxUrl);
    await sshClient.connect();
    await sshClient.mkdirp(sandboxUrl.pathname);
    const { stdout } = await sshClient.runCommand(
      `cd "${sandboxUrl.pathname}" && ${args.join(' ')}`,
    );
    return stdout;
  },
});
