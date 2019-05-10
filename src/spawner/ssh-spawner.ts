import {
  ChildSpawner,
  RunCommand,
  RunForeground,
  CommandSpec,
  Spawner,
} from './child-spawner';
import { Readable } from 'stream';
import { PseudoCwd } from './pseudo-cwd';

export type SshSpawner = ReturnType<typeof SshSpawner>;
export function SshSpawner(config: { path: string; hostname: string }) {
  const childSpawner = ChildSpawner();
  const pseudoCwd = PseudoCwd(config.path);
  const { toAbsolute, cwd } = pseudoCwd;

  function translateSpec(spec: CommandSpec) {
    const command = spec.path ? `cd "${toAbsolute(spec.path)}" && ${spec.exe}` : spec.exe;
    const translated: CommandSpec = {
      exe: 'ssh',
      args: [config.hostname, command, ...(spec.args || [])],
      input: spec.input,
    };
    return translated;
  }

  const runCommand: RunCommand = spec => {
    return childSpawner.runCommand(translateSpec(spec));
  };

  const runForeground: RunForeground = spec => {
    return childSpawner.runForeground(translateSpec(spec));
  };

  function shell() {
    return childSpawner.runForeground({
      exe: 'ssh',
      args: ['-t', config.hostname, `cd ${config.path} ; exec \$SHELL -l`],
      // ^^ https://stackoverflow.com/questions/626533/how-can-i-ssh-directly-to-a-particular-directory
    });
  }

  async function mkdirp(path?: string) {
    await runCommand({ exe: 'mkdir', args: ['-p', toAbsolute(path)] });
  }

  async function rimraf(path?: string) {
    await runCommand({ exe: 'rm', args: ['-rf', toAbsolute(path)] });
  }

  async function untar(input: Readable, path?: string) {
    await runCommand({
      exe: 'tar',
      args: ['-xz'],
      path: toAbsolute(path),
      input,
    });
  }

  const spawner: Spawner = {
    toAbsolute,
    cwd,
    mkdirp,
    rimraf,
    untar,
    shell,
    runCommand,
    runForeground,
  };

  return spawner;
}
