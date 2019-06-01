import { Cmd } from './types';
import { SpawnerBase } from './spawner-base';
import { GnuSpawner } from './gnu-spawner';
import { resolve, isAbsolute } from 'path';
import { APP_DIR, IMAGE_NAME } from './docker-spawner';

export function SshDockerSpawner(config: { path: string; hostname: string }) {
  if (!isAbsolute(config.path)) {
    throw new Error('path must be absolute');
  }

  return GnuSpawner({ abs, ...SpawnerBase(translate) });

  function abs(...paths: string[]) {
    return resolve(APP_DIR, ...paths);
  }

  function translate(cmd: Cmd) {
    const exe = 'ssh';
    const sshArgs: string[] = ['-L 5000:0.0.0.0:5000'];
    const dockerArgs: string[] = [
      'docker',
      'run',
      '--rm',
      '--privileged',
      '--interactive',
      '--network=host',
      '--volume',
      `${config.path}:${APP_DIR}`,
    ];

    if (cmd.tty) {
      sshArgs.push('-t');
      dockerArgs.push('--tty');
    }

    sshArgs.push(config.hostname);

    if (cmd.cwd) {
      dockerArgs.push('--workdir', abs(cmd.cwd));
    }

    dockerArgs.push(IMAGE_NAME);
    dockerArgs.push(cmd.exe);

    if (cmd.args) {
      dockerArgs.push(...cmd.args);
    }

    const translated: Cmd = {
      exe,
      args: [...sshArgs, ...dockerArgs],
      input: cmd.input,
    };

    return translated;
  }
}
