import { Readable } from 'stream';

import { spawn, spawnSync } from 'child_process';

import signalExit = require('signal-exit');
import mkdirpJs = require('mkdirp');
import rimrafJs = require('rimraf');
import { promisify } from 'util';
import chalk from 'chalk';
import { TerseError } from '@alwaysai/alwayscli';
import { PseudoCwd } from './pseudo-cwd';

export type CommandSpec = {
  exe: string;
  args?: string[];
  path?: string;
  input?: Readable;
};

export type RunCommand = (spec: CommandSpec) => Promise<string>;
export type RunForeground = (spec: CommandSpec) => void;

export type Spawner = ReturnType<typeof ChildSpawner>;

export function ChildSpawner(context: { path?: string } = {}) {
  const pseudoCwd = PseudoCwd(process.cwd());
  pseudoCwd.cd(context.path);
  const { toAbsolute, cwd } = pseudoCwd;

  const runCommand: RunCommand = (spec: CommandSpec) => {
    const path = spec.path ? toAbsolute(spec.path) : undefined;
    return new Promise((resolve, reject) => {
      const child = spawn(spec.exe, spec.args || [], { cwd: path });
      signalExit(() => {
        child.kill();
      });

      if (spec.input) {
        spec.input.pipe(child.stdin);
      }

      // TODO: Limit buffer size
      const outChunks: Buffer[] = [];
      const allChunks: Buffer[] = []; // stderr and stdout

      child.stdout.on('data', chunk => {
        outChunks.push(chunk);
        allChunks.push(chunk);
      });

      child.stderr.on('data', chunk => {
        allChunks.push(chunk);
      });

      child.on('error', err => {
        reject(err);
      });

      child.on('close', code => {
        if (code === 0) {
          const data = Buffer.concat(outChunks).toString('utf8');
          resolve(data);
        } else {
          let message = `Process exited with non-zero status code ${chalk.bold(
            code.toString(),
          )}`;
          message += '\n\n';
          message += `$ ${spec.exe} ${spec.args ? spec.args.join(' ') : ''}`;
          message += '\n\n';
          message += Buffer.concat(allChunks).toString('utf8');
          reject(new TerseError(message));
        }
      });
    });
  };

  const runForeground: RunForeground = (spec: CommandSpec) => {
    const out = spawnSync(spec.exe, spec.args || [], {
      cwd: spec.path ? toAbsolute(spec.path) : undefined,
      stdio: 'inherit',
    });
    if (out.error) {
      throw out.error;
    }
  };

  function shell() {
    runForeground({ exe: '/bin/bash', args: ['--login'], path: context.path });
  }

  async function mkdirp(path?: string) {
    await promisify(mkdirpJs)(toAbsolute(path));
  }

  async function rimraf(path?: string) {
    await promisify(rimrafJs)(toAbsolute(path));
  }

  // TODO: Use JS implementation
  async function untar(input: Readable, path?: string) {
    await runCommand({
      exe: 'tar',
      args: ['-xz'],
      path: toAbsolute(path),
      input,
    });
  }

  return {
    toAbsolute,
    cwd,
    mkdirp,
    rimraf,
    shell,
    untar,
    runCommand,
    runForeground,
  };
}
