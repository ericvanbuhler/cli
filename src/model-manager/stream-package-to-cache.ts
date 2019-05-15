import { rename, createWriteStream } from 'fs';
import { promisify } from 'util';
import { Readable } from 'stream';

import pump = require('pump');
import rimraf = require('rimraf');

import { getRandomString } from '../get-random-string';
import { ModelPackagePath } from './model-package-path';
import mkdirp = require('mkdirp');
import { dirname } from 'path';

const rimrafAsync = promisify(rimraf);

export async function streamPackageToCache(opts: {
  id: string;
  version: string;
  readable: Readable;
}) {
  const packagePath = ModelPackagePath(opts);
  await promisify(mkdirp)(dirname(packagePath));

  const downloadPath = `${packagePath}.${getRandomString()}.download`;
  try {
    await new Promise((resolve, reject) => {
      const writeable = createWriteStream(downloadPath);

      pump(opts.readable, writeable, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    await promisify(rename)(downloadPath, packagePath);
  } finally {
    await rimrafAsync(downloadPath);
  }
}
