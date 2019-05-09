import { Readable } from 'stream';

import { isAbsolute, join } from 'path';
import { spawn, spawnSync } from 'child_process';

import signalExit = require('signal-exit');
import mkdirpJs = require('mkdirp');
import rimrafJs = require('rimraf');
import { promisify } from 'util';
import chalk from 'chalk';
import { TerseError } from '@alwaysai/alwayscli';

export type CommandSpec = {
  exe: string;
  args?: string[];
  cwd?: string;
  input?: Readable;
};

export type RunCommand = (spec: CommandSpec) => Promise<string>;
export type RunForeground = (spec: CommandSpec) => void;

export function checkPathIsAbsolute(path?: string) {
  if (path && !isAbsolute(path)) {
    throw new Error('If provided, path must be absolute');
  }
}

export function ChildSpawner(config: { path: string }) {
  checkPathIsAbsolute(config.path);

  function toAbsolute(path?: string) {
    if (typeof path === 'undefined') {
      return config.path;
    }

    if (isAbsolute(path)) {
      return path;
    }

    return join(config.path, path);
  }

  const runCommand: RunCommand = (spec: CommandSpec) => {
    const cwd = spec.cwd ? toAbsolute(spec.cwd) : undefined;
    return new Promise((resolve, reject) => {
      const child = spawn(spec.exe, spec.args || [], { cwd });
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
      cwd: spec.cwd ? toAbsolute(spec.cwd) : undefined,
      stdio: 'inherit',
    });
    if (out.error) {
      throw out.error;
    }
  };

  function shell() {
    runForeground({ exe: '/bin/bash', args: ['--login'], cwd: config.path });
  }

  async function mkdirp(path?: string) {
    await promisify(mkdirpJs)(toAbsolute(path));
  }

  async function rimraf(path?: string) {
    await promisify(rimrafJs)(toAbsolute(path));
  }

  // TODO: Use JS implementation
  async function untar(input: Readable, cwd: string) {
    await runCommand({ exe: 'tar', args: ['-xz'], cwd: toAbsolute(cwd), input });
  }

  return {
    path: config.path,
    toAbsolute,
    mkdirp,
    rimraf,
    shell,
    untar,
    runCommand,
    runForeground,
  };
}
