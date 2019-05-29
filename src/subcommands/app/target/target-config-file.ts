import { join } from 'path';

import * as t from 'io-ts';

import { ConfigFile } from '@alwaysai/config-nodejs';
import { TerseError } from '@alwaysai/alwayscli';

import { SshSpawner } from '../../../spawner/ssh-spawner';
import { DockerSpawner } from '../../../spawner/docker-spawner';
import { TargetProtocol } from '../../../target-protocol';
import chalk from 'chalk';
import { SshDockerSpawner } from '../../../spawner/ssh-docker-spawner';

const FILE_NAME = 'alwaysai.target.json';

const sshTarget = t.type(
  {
    protocol: t.literal(TargetProtocol['ssh:']),
    hostname: t.string,
    path: t.string,
  },
  'SshTarget',
);

const sshDockerTarget = t.type(
  {
    protocol: t.literal(TargetProtocol['ssh+docker:']),
    hostname: t.string,
    path: t.string,
  },
  'SshDockerTarget',
);

const dockerTarget = t.type({
  protocol: t.literal(TargetProtocol['docker:']),
});

const targetConfigCodec = t.taggedUnion('protocol', [
  sshTarget,
  dockerTarget,
  sshDockerTarget,
]);
export type TargetConfig = t.TypeOf<typeof targetConfigCodec>;

const DID_YOU_RUN_INIT = 'Did you run "alwaysai app target init"?';

const ENOENT = {
  message: `${FILE_NAME} not found. ${DID_YOU_RUN_INIT}`,
  code: 'TERSE',
};

function TargetConfigFile(dir = process.cwd()) {
  const filePath = join(dir, FILE_NAME);
  const configFile = ConfigFile({ path: filePath, codec: targetConfigCodec, ENOENT });

  return {
    ...configFile,
    readSpawner,
    describe,
  };

  function describe() {
    const config = configFile.read();
    const docker = chalk.bold('docker');
    const ssh = chalk.bold('ssh');
    switch (config.protocol) {
      case 'docker:': {
        return `Target: ${docker} container on this host`;
      }
      case 'ssh:': {
        const hostname = chalk.bold(config.hostname);
        const path = chalk.bold(config.path);
        return `Target: ${ssh} destination ${hostname}, path ${path}`;
      }
      case 'ssh+docker:': {
        const hostname = chalk.bold(config.hostname);
        const path = chalk.bold(config.path);
        return `Target: ${docker} container on ${ssh} destination ${hostname}, path ${path}`;
      }
      default:
        throw new Error('Unexpected protocol');
    }
  }

  function readSpawner() {
    const config = configFile.read();
    switch (config.protocol) {
      case 'ssh:':
      case 'ssh+docker:': {
        if (!config.hostname) {
          throw new TerseError(
            `"hostname" is required for protocol "${
              config.protocol
            }". ${DID_YOU_RUN_INIT}`,
          );
        }
        if (!config.path) {
          throw new TerseError(
            `"path" is required for protocol "${config.protocol}". ${DID_YOU_RUN_INIT}`,
          );
        }
        const factory = config.protocol === 'ssh:' ? SshSpawner : SshDockerSpawner;
        const spawner = factory({ path: config.path, hostname: config.hostname });
        return spawner;
      }

      case 'docker:': {
        return DockerSpawner();
      }

      default:
        throw new TerseError('Unsupported protocol');
    }
  }
}

export const targetConfigFile = TargetConfigFile();
