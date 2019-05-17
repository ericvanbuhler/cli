import { Cmd } from './types';
import { SpawnerBase } from './spawner-base';
import { GnuSpawner } from './gnu-spawner';
import { resolve } from 'path';

export function ChildSpawner(context: { path?: string } = {}) {
  return GnuSpawner({ abs, ...SpawnerBase(translate) });

  function abs(...paths: string[]) {
    return resolve(context.path || '', ...paths);
  }

  function translate(cmd: Cmd) {
    const translated = { ...cmd };
    if (cmd.cwd) {
      translated.cwd = abs(cmd.cwd);
    }

    return translated;
  }
}
