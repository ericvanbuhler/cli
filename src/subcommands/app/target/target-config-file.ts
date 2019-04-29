import { join } from 'path';

import * as t from 'io-ts';
import { ConfigFile } from '@alwaysai/config-nodejs';
import { SshClient } from '../../../ssh-client';

const FILE_NAME = 'alwaysai.target.json';

const required = t.type({
  hostname: t.string,
  path: t.string,
});

const optional = t.partial({
  port: t.number,
  username: t.string,
  password: t.string,
  privateKeyPath: t.string,
});

const codec = t.intersection([required, optional], 'TargetConfig');

const ENOENT = {
  message: `${FILE_NAME} not found. Did you run "alwaysai app target init"?`,
  code: 'TERSE',
};

function TargetConfigFile(dir = process.cwd()) {
  const path = join(dir, FILE_NAME);
  const configFile = ConfigFile({ path, codec, ENOENT });
  return {
    ...configFile,
    async connectToTarget() {
      const config = configFile.read();
      const sshClient = new SshClient(config);
      await sshClient.connect();
      return sshClient;
    },
  };
}

export const targetConfigFile = TargetConfigFile();
