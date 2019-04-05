import { createLeaf } from '@alwaysai/always-cli';
import { devConfigFile } from './dev-config-file';

export const show = createLeaf({
  name: 'show',
  description: "Show this directory's developer configuration",
  options: {},
  async action() {
    const devConfig = devConfigFile.read();
    return devConfig;
  },
});
