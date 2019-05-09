import { createLeaf, createStringArrayInput } from '@alwaysai/alwayscli';
import { targetConfigFile } from './target-config-file';

export const exec = createLeaf({
  name: 'exec',
  description: 'Run a command in the remote target directory',
  args: createStringArrayInput({
    placeholder: '<command> [<args>]',
    required: true,
  }),
  action([exe, ...args]) {
    const spawner = targetConfigFile.readSpawner();
    const config = targetConfigFile.read();
    spawner.runForeground({ exe, args, cwd: config.path });
  },
});
