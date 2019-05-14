import { readdir as fsReaddir } from 'fs';

import { Readable } from 'stream';
import { promisify } from 'util';
import { isAbsolute, resolve } from 'path';

import * as tarJs from 'tar';
import * as mkdirpJs from 'mkdirp';
import * as rimrafJs from 'rimraf';

import { Spawner, Cmd } from './types';
import { SpawnerBase } from './spawner-base';
import { GnuSpawner } from './gnu-spawner';

export function JsSpawner(context: { path?: string } = {}): Spawner {
  const gnuSpawner = GnuSpawner({ abs, ...SpawnerBase(translate) });
  return {
    ...gnuSpawner,
    abs,
    readdir,
    mkdirp,
    rimraf,
    tar,
  };

  function abs(...paths: string[]) {
    return resolve(context.path || '', ...paths);
  }

  function translate(cmd: Cmd) {
    const translated: Cmd = {
      ...cmd,
    };

    if (cmd.cwd) {
      translated.cwd = abs(cmd.cwd);
    }

    return translated;
  }

  function mkdirp(path = '') {
    return promisify(mkdirpJs)(abs(path));
  }

  function rimraf(path = '') {
    return promisify(rimrafJs)(abs(path));
  }

  function readdir(path = '') {
    return promisify(fsReaddir)(abs(path));
  }

  async function tar(...paths: string[]) {
    for (const path in paths) {
      if (isAbsolute(path)) {
        throw new Error('Paths passed to spawner.tar must not be absolute');
      }
    }
    const packageStream = (tarJs.create(
      { sync: true, gzip: true, cwd: abs() },
      paths,
    ) as unknown) as Readable;
    // ^^ The @types for tar.create are not correct
    return packageStream;
  }
}
