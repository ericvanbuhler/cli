import { createLeaf } from '@alwaysai/alwayscli';
import { targetConfigFile } from './target-config-file';

export const shell = createLeaf({
  name: 'shell',
  description: 'Run a shell in the remote target',
  action() {
    const spawner = targetConfigFile.readSpawner();
    spawner.shell();
  },
});
