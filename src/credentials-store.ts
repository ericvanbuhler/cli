import { join } from 'path';

import { ALWAYSAI_CONFIG_DIR, ConfigFile } from '@alwaysai/config-nodejs';
import * as t from 'io-ts';
import { ICognitoStorage } from 'amazon-cognito-identity-js';

const codec = t.record(t.string, t.any);

export const PLEASE_LOG_IN_MESSAGE =
  'Authentication is required for this action. Please run "alwaysai user login"';

const ENOENT = {
  message: PLEASE_LOG_IN_MESSAGE,
  code: 'TERSE',
};

const path = join(ALWAYSAI_CONFIG_DIR, 'alwaysai.credentials.json');

export const configFile = ConfigFile({
  path,
  codec,
  ENOENT,
  initialValue: {},
});

configFile.update(() => {
  // No-op
});

const storage: ICognitoStorage = {
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

export const credentialsStore = { ...configFile, ...storage };
