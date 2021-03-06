import * as tar from 'tar';
import { Readable } from 'stream';
import { readdirSync } from 'fs';
import difference = require('lodash.difference');

const IGNORE_FILE_NAMES = ['.git', 'node_modules'];

export function createTarbombStream(dir: string) {
  const allFileNames = readdirSync(dir);
  const filteredFileNames = difference(allFileNames, IGNORE_FILE_NAMES);
  if (filteredFileNames.length === 0) {
    throw new Error(`Directory "${dir}" has no non-ignored content`);
  }
  const packageStream = (tar.create(
    { sync: true, gzip: true, cwd: dir },
    filteredFileNames,
  ) as unknown) as Readable;
  // ^^ The @types for tar.create are not correct
  return packageStream;
}
