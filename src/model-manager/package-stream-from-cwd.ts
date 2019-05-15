import { basename, join, resolve } from 'path';
import difference = require('lodash.difference');

import { JsSpawner } from '../spawner/js-spawner';
import { IGNORED_FILE_NAMES } from '../constants';

export async function PackageStreamFromCwd(path?: string) {
  const cwd = resolve(path || '');
  const dir = basename(cwd);
  const spawner = JsSpawner({ path: resolve(cwd, '..') });
  const allFileNames = await spawner.readdir(dir);
  const fileNames = difference(allFileNames, IGNORED_FILE_NAMES);
  const paths = fileNames.map(fileName => join(dir, fileName));
  const readable = await spawner.tar(...paths);
  return readable;
}
