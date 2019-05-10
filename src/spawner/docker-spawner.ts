import { Readable } from 'stream';

import {
  ChildSpawner,
  RunCommand,
  RunForeground,
  CommandSpec,
  Spawner,
} from './child-spawner';
import { checkTerminalIsInteractive } from '../prompt';
import { PseudoCwd } from './pseudo-cwd';

const IMAGE_NAME = 'alwaysai/edgeiq';
const DEFAULT_PATH = '/app';

export function DockerSpawner(context: { path?: string } = {}) {
  const childSpawner = ChildSpawner();

  const pseudoCwd = PseudoCwd(DEFAULT_PATH);
  pseudoCwd.cd(context.path);

  const { toAbsolute, cwd } = pseudoCwd;

  // Workdir determines the user's current working directory in the container
  const Workdir = (path?: string) => ['--workdir', toAbsolute(path)];

  // Mount a filesystem volume in the container https://docs.docker.com/storage/volumes/
  const Volume = () => ['--volume', `${process.cwd()}:${cwd()}`];

  function translateSpec(spec: CommandSpec) {
    const args = ['run', '--interactive', ...Volume()];
    if (spec.path) {
      args.push(...Workdir(spec.path));
    }
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
        ...Volume(),
        ...Workdir(context.path),
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

  async function untar(input: Readable, path?: string) {
    await runCommand({ exe: 'tar', args: ['-xz'], path: toAbsolute(path), input });
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
