import { Cmd } from './types';
import { SpawnerBase } from './spawner-base';
import { GnuSpawner } from './gnu-spawner';
import { resolve, isAbsolute } from 'path';

export type SshSpawner = ReturnType<typeof SshSpawner>;
export function SshSpawner(config: { path: string; hostname: string }) {
  if (!isAbsolute(config.path)) {
    throw new Error('path must be absolute');
  }

  return GnuSpawner({ abs, ...SpawnerBase(translate) });

  function abs(...paths: string[]) {
    return resolve(config.path, ...paths);
  }

  function translate(cmd: Cmd) {
    const exe = 'ssh';
    const args: string[] = [];
    if (cmd.tty) {
      args.push('-t');
    }
    args.push(config.hostname, cmd.cwd ? `cd "${abs(cmd.cwd)}" && ${cmd.exe}` : cmd.exe);
    if (cmd.args) {
      args.push(...cmd.args);
    }
    const translated: Cmd = {
      exe,
      args,
      input: cmd.input,
    };
    return translated;
  }
}
