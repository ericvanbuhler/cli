import { join } from 'path';

import * as t from 'io-ts';
import * as c from '@alwaysai/codecs';

import { ConfigFile, ALWAYSAI_CONFIG_DIR } from '@alwaysai/config-nodejs';
import { TERSE } from '@alwaysai/always-cli';
import { CLI_NAME } from './constants';

const props = {
  systemId: c.systemId,
};

const codec = t.partial(props);

export type CliConfig = t.TypeOf<typeof codec>;

export const CLI_CONFIG_KEYS = Object.keys(props) as (keyof CliConfig)[];

const FILE_NAME = 'alwaysai.cli.json';
const path = join(ALWAYSAI_CONFIG_DIR, FILE_NAME);

export const cliConfigFile = ConfigFile({
  path,
  codec,
  ENOENT: {
    code: TERSE,
    message: `File not found. Run "${CLI_NAME} config set" to set config values.`,
  },
  initialValue: {},
});

export function readSystemId(): t.TypeOf<typeof c.systemId> {
  const maybeConfig = cliConfigFile.readIfExists();
  return (maybeConfig && maybeConfig.systemId) || 'production';
}
