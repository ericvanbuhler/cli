import { createLeaf } from '@alwaysai/always-cli';
import { appConfigFile } from '../../app-config-file';

export const show = createLeaf({
  name: 'show',
  description: "Show this directory's alwaysAI application configuration",
  options: {},
  action() {
    const config = appConfigFile.read();
    return config;
  },
});
