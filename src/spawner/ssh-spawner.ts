import { Cmd } from './types';
import { SpawnerBase, spawnerBase } from './spawner-base';
import { GnuSpawner } from './gnu-spawner';
import { resolve } from 'path';

export type SshSpawner = ReturnType<typeof SshSpawner>;
export function SshSpawner(config: { path: string; hostname: string }) {
  const gnuSpawner = GnuSpawner({ abs, ...SpawnerBase(translate) });

  return {
    ...gnuSpawner,
    shell,
  };

  function abs(...paths: string[]) {
    return resolve(config.path, ...paths);
  }

  function translate(cmd: Cmd) {
    const command = cmd.cwd ? `cd "${abs(cmd.cwd)}" && ${cmd.exe}` : cmd.exe;
    const translated: Cmd = {
      exe: 'ssh',
      args: [config.hostname, command, ...(cmd.args || [])],
      input: cmd.input,
    };
    return translated;
  }

  function shell() {
    spawnerBase.runForeground({
      exe: 'ssh',
      args: ['-t', config.hostname, `cd "${abs()}"; exec $SHELL -l`],
      // ^^ https://stackoverflow.com/questions/626533/how-can-i-ssh-directly-to-a-particular-directory
    });
  }
}
