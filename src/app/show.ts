import { createLeaf } from '@alwaysai/always-cli';
import { appConfigFile } from '../app-config-file';

export const show = createLeaf({
  name: 'show',
  description: "Show this directory's alwaysAI application configuration",
  options: {},
  action() {
    try {
      const config = appConfigFile.read();
      return config;
    } catch (ex) {
      if (ex.code === 'ENOENT') {
        throw 'The current directory is not an alwaysAI application';
      }
      throw ex;
    }
  },
});
