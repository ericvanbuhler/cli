import { ChildSpawner, RunCommand, RunForeground, CommandSpec } from './child-spawner';
import { Readable } from 'stream';
import { checkTerminalIsInteractive } from '../prompt';

const IMAGE_NAME = 'alwaysai/edgeiq';

export type DockerSpawner = ReturnType<typeof DockerSpawner>;
export function DockerSpawner(config: { path: string }) {
  const childSpawner = ChildSpawner(config);
  const { toAbsolute } = childSpawner;
  const volumeArgs = ['--volume', `${process.cwd()}:${config.path}`];

  const getWorkdirArgs = (cwd?: string) => (cwd ? ['--workdir', toAbsolute(cwd)] : []);

  function translateSpec(spec: CommandSpec) {
    const args = ['run', '--interactive', ...volumeArgs];
    args.push(...getWorkdirArgs(spec.cwd));
    args.push(IMAGE_NAME, spec.exe);

    if (spec.args) {
      args.push(...spec.args);
    }

    const translated: CommandSpec = {
      exe: 'docker',
      args,
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
    checkTerminalIsInteractive();
    childSpawner.runForeground({
      exe: 'docker',
      args: [
        'run',
        '--tty',
        '--interactive',
        ...volumeArgs,
        ...getWorkdirArgs(config.path),
        IMAGE_NAME,
        '/bin/bash',
      ],
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
