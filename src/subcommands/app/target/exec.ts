import { createLeaf, createStringArrayInput } from '@alwaysai/always-cli';
import { targetConfigFile } from './target-config-file';

export const exec = createLeaf({
  name: 'exec',
  description: 'Run a command in the remote target directory',
  args: createStringArrayInput({
    placeholder: '<command> [<args>]',
    required: true,
  }),
  async action(args) {
    const sshClient = await targetConfigFile.connectToTarget();
    const { stdout } = await sshClient.runCommand(args.join(' '));
    return stdout;
  },
});
