import { Spawner, Cmd } from './types';
import { SpawnerBase } from './spawner-base';
import { GnuSpawner } from './gnu-spawner';
import { resolve } from 'path';

const IMAGE_NAME = 'alwaysai/edgeiq';
const APP_DIR = '/app';

export function DockerSpawner(): Spawner {
  const gnuSpawner = GnuSpawner({ abs, ...SpawnerBase(translate) });

  return {
    ...gnuSpawner,
    rimraf(path?: string) {
      if (abs(path || '') === abs()) {
        throw new Error('Refusing to delete whole directory because it is mirrored');
      }
      return gnuSpawner.rimraf(path);
    },
  };

  function abs(...paths: string[]) {
    return resolve(APP_DIR, ...paths);
  }

  function translate(cmd: Cmd) {
    const args = ['run', '--interactive', ...VolumeArgs()];
    if (cmd.tty) {
      args.push('--tty');
    }
    if (cmd.cwd) {
      args.push(...WorkdirArgs(cmd.cwd));
    }
    args.push(IMAGE_NAME, cmd.exe);

    if (cmd.args) {
      args.push(...cmd.args);
    }

    const translated: Cmd = {
      exe: 'docker',
      args,
      input: cmd.input,
    };

    return translated;
  }

  // Mount a filesystem volume in the container https://docs.docker.com/storage/volumes/
  function VolumeArgs() {
    return ['--volume', `${process.cwd()}:${abs()}`];
  }

  // Workdir determines the user's current working directory in the container
  function WorkdirArgs(path = '') {
    return ['--workdir', abs(path)];
  }
}
