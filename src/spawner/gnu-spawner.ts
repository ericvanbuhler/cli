import { Readable } from 'stream';

import { Spawner } from './types';
import { isAbsolute } from 'path';
import { CodedError } from '@carnesen/coded-error';

export function GnuSpawner(context: {
  abs: Spawner['abs'];
  run: Spawner['run'];
  runForeground: Spawner['runForeground'];
  runStreaming: Spawner['runStreaming'];
}): Spawner {
  const { abs, run, runForeground, runStreaming } = context;

  return {
    run,
    runForeground,
    runStreaming,
    abs,
    readdir,
    mkdirp,
    rimraf,
    tar,
    untar,
    exists,
  };

  async function mkdirp(path?: string) {
    await run({ exe: 'mkdir', args: ['-p', abs(path || '')] });
  }

  async function readdir(path?: string) {
    let output: string;
    const absPath = abs(path || '');
    try {
      output = await run({ exe: 'ls', args: ['-A1', absPath] });
      // ^^ The output looks like '/foo/bar.txt' if path is an existing file or else it looks like 'a b c' if the path is a directory with files/subdirs a, b, c.
    } catch (ex) {
      if (
        ex &&
        typeof ex.message === 'string' &&
        ex.message.includes('No such file or directory')
      ) {
        ex.code = 'ENOENT';
      }
      throw ex;
    }
    if (isAbsolute(output)) {
      throw new CodedError(`ENOTDIR: not a directory "${absPath}"`, 'ENOTDIR');
    }
    return output.length > 0 ? output.split('\n') : [];
  }

  async function rimraf(path?: string) {
    await run({ exe: 'rm', args: ['-rf', abs(path || '')] });
  }

  async function tar(...paths: string[]) {
    return await runStreaming({
      exe: 'tar',
      args: ['-cz', ...paths],
      cwd: abs(),
    });
  }

  async function untar(input: Readable, cwd = '') {
    await run({
      exe: 'tar',
      args: ['-xz'],
      cwd: abs(cwd),
      input,
    });
  }

  async function exists(path: string) {
    if (!path) {
      throw new Error('"path" is required');
    }
    try {
      await run({ exe: 'stat', args: [abs(path)] });
      return true;
    } catch (ex) {
      return false;
    }
  }
}
