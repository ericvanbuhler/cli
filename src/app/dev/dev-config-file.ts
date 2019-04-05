import { join } from 'path';

import * as t from '@alwaysai/codecs';
import { ConfigFile } from '@alwaysai/config-nodejs';

const DEV_CONFIG_FILE_NAME = 'alwaysai.dev.json';

const codec = t.type({
  sandboxUrl: t.string,
});

const ENOENT = {
  message: `${DEV_CONFIG_FILE_NAME} not found. Did you run "alwaysai dev init"?`,
  code: 'TERSE',
};

function DevConfigFile(dir = process.cwd()) {
  const path = join(dir, DEV_CONFIG_FILE_NAME);
  const configFile = ConfigFile({ path, codec, ENOENT });
  return configFile;
}

export const devConfigFile = DevConfigFile();
