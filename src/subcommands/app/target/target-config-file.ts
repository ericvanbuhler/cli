import { join } from 'path';

import KeyMirror = require('keymirror');
import * as t from 'io-ts';

import { ConfigFile } from '@alwaysai/config-nodejs';
import { SshSpawner } from '../../../spawner/ssh-spawner';
import { TerseError } from '@alwaysai/alwayscli';
import { ChildSpawner } from '../../../spawner/child-spawner';
import { DockerSpawner } from '../../../spawner/docker-spawner';

const FILE_NAME = 'alwaysai.target.json';

export const Protocol = KeyMirror({
  'ssh:': null,
  'file:': null,
  'docker:': null,
});

export type Protocol = keyof typeof Protocol;
const protocolCodec = t.keyof(Protocol);
export const PROTOCOLS = Object.keys(Protocol) as Protocol[];

const codec = t.partial(
  {
    protocol: protocolCodec,
    hostname: t.string,
    path: t.string,
  },
  'TargetConfig',
);

const DID_YOU_RUN_INIT = 'Did you run "alwaysai app target init"?';

const ENOENT = {
  message: `${FILE_NAME} not found. ${DID_YOU_RUN_INIT}`,
  code: 'TERSE',
};

function TargetConfigFile(dir = process.cwd()) {
  const path = join(dir, FILE_NAME);
  const configFile = ConfigFile({ path, codec, ENOENT, initialValue: {} });
  return {
    ...configFile,
    readSpawner() {
      const config = configFile.readIfExists() || {};
      const { protocol, hostname, path } = config;
      switch (protocol) {
        case 'ssh:':
          if (!hostname) {
            throw new TerseError(
              `"hostname" is required for protocol "${protocol}". ${DID_YOU_RUN_INIT}`,
            );
          }
          if (!path) {
            throw new TerseError(
              `"path" is required for protocol "${protocol}". ${DID_YOU_RUN_INIT}`,
            );
          }
          const sshSpawner = SshSpawner({ path, hostname });
          return sshSpawner;
        case 'file:':
        case undefined:
          return ChildSpawner({ path: config.path || dir });
        case 'docker:':
          if (!path) {
            throw new TerseError(
              `"path" is required for protocol "${protocol}". ${DID_YOU_RUN_INIT}`,
            );
          }

          return DockerSpawner({ path });
        default:
          throw new TerseError(`Unsupported protocol "${config.protocol}"`);
      }
    },
  };
}

export const targetConfigFile = TargetConfigFile();
