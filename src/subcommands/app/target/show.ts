import { createLeaf } from '@alwaysai/always-cli';
import { targetConfigFile } from './target-config-file';

export const show = createLeaf({
  name: 'show',
  description: "Show this directory's developer configuration",
  options: {},
  action() {
    return targetConfigFile.read();
  },
});
