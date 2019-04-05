import * as tar from 'tar';
import { Readable } from 'stream';
import { readdirSync } from 'fs';
import difference = require('lodash.difference');

const IGNORE_FILE_NAMES = ['.git', 'node_modules'];

export function createPackageStream(dir = process.cwd()) {
  const allFileNames = readdirSync(dir);
  const filteredFileNames = difference(allFileNames, IGNORE_FILE_NAMES);
  const packageStream = (tar.create(
    { sync: true, gzip: true, cwd: dir },
    filteredFileNames,
  ) as unknown) as Readable;
  return packageStream;
}
