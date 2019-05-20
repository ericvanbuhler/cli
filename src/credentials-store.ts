import { join } from 'path';

import { ALWAYSAI_CONFIG_DIR, ConfigFile } from '@alwaysai/config-nodejs';
import * as t from 'io-ts';
import { ICognitoStorage } from 'amazon-cognito-identity-js';

const codec = t.record(t.string, t.any);

const ENOENT = {
  message: 'Authentication is required for this action. Please run "alwaysai user logIn"',
  code: 'TERSE',
};

const path = join(ALWAYSAI_CONFIG_DIR, 'alwaysai.credentials.json');

export const configFile = ConfigFile({
  path,
  codec,
  ENOENT,
  initialValue: {},
});

configFile.update(() => {});

export const credentialsStore: ICognitoStorage = {
  ...configFile,
  setItem(key: string, value: string) {
    configFile.update(config => {
      config[key] = value;
    });
  },
  getItem(key: string) {
    return configFile.read()[key];
  },
  removeItem(key: string) {
    configFile.update(config => {
      delete config[key];
    });
  },
  clear() {
    configFile.remove();
  },
};
