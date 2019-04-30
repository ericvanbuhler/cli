import { join } from 'path';

import * as t from 'io-ts';
import { ConfigFile } from '@alwaysai/config-nodejs';

export const MODEL_CONFIG_FILE_NAME = 'alwaysai.model.json';

export const codec = t.type(
  {
    publisher: t.string,
    name: t.string,
    version: t.string,
    description: t.string,
    accuracy: t.string,
    license: t.string,
    public: t.boolean,
    uuid: t.string,
    packageUrl: t.string,
  },
  MODEL_CONFIG_FILE_NAME,
);

const ENOENT = {
  message: `${MODEL_CONFIG_FILE_NAME} not found. Did you run "alwaysai model init"?`,
  code: 'TERSE',
};

export function ModelConfigFile(dir = process.cwd()) {
  const path = join(dir, MODEL_CONFIG_FILE_NAME);
  const configFile = ConfigFile({ path, codec, ENOENT });
  return configFile;
}

export const modelConfigFile = ModelConfigFile();
