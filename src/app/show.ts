import { createLeaf } from '@alwaysai/always-cli';
import { APP_CONFIG_FILE_NAME, readAppConfigFile } from '../app-config-file';

export const show = createLeaf({
  name: 'show',
  description: "Show this directory's alwaysAI application configuration",
  options: {},
  action() {
    try {
      const appConfig = readAppConfigFile(APP_CONFIG_FILE_NAME);
      return appConfig;
    } catch (ex) {
      if (ex.code === 'ENOENT') {
        throw 'The current directory is not an alwaysAI application';
      }
      throw ex;
    }
  },
});
