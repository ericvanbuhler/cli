import { join } from 'path';

import * as t from 'io-ts';
import { ConfigFile } from '@alwaysai/config-nodejs';

export const APP_CONFIG_FILE_NAME = 'alwaysai.app.json';

const codec = t.partial({
  publisher: t.string,
  name: t.string,
  version: t.string,
  models: t.record(t.string, t.string, 'models'),
  scripts: t.record(t.string, t.string, 'scripts'),
  repository: t.string,
});

const ENOENT = {
  message: `${APP_CONFIG_FILE_NAME} not found. Did you run "alwaysai app init"?`,
  code: 'TERSE',
};

export function AppConfigFile(dir = process.cwd()) {
  const path = join(dir, APP_CONFIG_FILE_NAME);
  const configFile = ConfigFile({ path, codec, ENOENT });
  return {
    ...configFile,
    addModel(id: string) {
      return configFile.update(config => {
        config.models = config.models || {};
        config.models[id] = '*';
      });
    },
    removeModel(id: string) {
      return configFile.update(config => {
        if (config.models) {
          delete config.models[id];
        }
      });
    },
  };
}

export const appConfigFile = AppConfigFile();
