import { basename, join, resolve } from 'path';
import difference = require('lodash.difference');

import { JsSpawner } from '../spawner/js-spawner';

export async function PackageStreamFromCwd(
  opts: Partial<{ cwd: string; ignoredFileNames: string[] }> = {},
) {
  const cwd = resolve(opts.cwd || '');
  const dir = basename(cwd);
  const spawner = JsSpawner({ path: resolve(cwd, '..') });
  const fileNames = await spawner.readdir(dir);
  const filteredFileNames = opts.ignoredFileNames
    ? difference(fileNames, opts.ignoredFileNames)
    : fileNames;
  const paths = filteredFileNames.map(fileName => join(dir, fileName));
  const readable = await spawner.tar(...paths);
  return readable;
}
