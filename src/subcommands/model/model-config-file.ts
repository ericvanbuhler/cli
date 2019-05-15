import { join } from 'path';
import * as t from 'io-ts';

import { ConfigFile } from '@alwaysai/config-nodejs';
import { rpcMethodSpecs } from '@alwaysai/cloud-api';

export const MODEL_CONFIG_FILE_NAME = 'alwaysai.model.json';

const { argsCodec } = rpcMethodSpecs.createModelVersion;
const { props } = argsCodec.types[0];
export const codec = t.type(props);

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
