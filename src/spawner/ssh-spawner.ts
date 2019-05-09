import { ChildSpawner, RunCommand, RunForeground, CommandSpec } from './child-spawner';
import { Readable } from 'stream';

export type SshSpawner = ReturnType<typeof SshSpawner>;
export function SshSpawner(config: { path: string; hostname: string }) {
  const childSpawner = ChildSpawner(config);
  const { toAbsolute } = childSpawner;

  function translateSpec(spec: CommandSpec) {
    const command = spec.cwd ? `cd "${toAbsolute(spec.cwd)}" && ${spec.exe}` : spec.exe;
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

  async function untar(input: Readable, cwd: string) {
    await runCommand({ exe: 'tar', args: ['-xz'], cwd, input });
  }

  return {
    path: config.path,
    toAbsolute,
    mkdirp,
    rimraf,
    untar,
    shell,
    runCommand,
    runForeground,
  };
}
