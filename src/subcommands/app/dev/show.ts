import { createLeaf } from '@alwaysai/always-cli';
import { devConfigFile } from './dev-config-file';
import { SandboxUrl } from '../../../sandbox-url';

export const show = createLeaf({
  name: 'show',
  description: "Show this directory's developer configuration",
  options: {},
  async action() {
    const devConfig = devConfigFile.read();
    return SandboxUrl.parse(devConfig.sandboxUrl);
  },
});
