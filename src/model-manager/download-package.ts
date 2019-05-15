import { rename, createWriteStream } from 'fs';
import { promisify } from 'util';
import { dirname } from 'path';

import mkdirp = require('mkdirp');
import pump = require('pump');
import { S3 } from 'aws-sdk';
import rimraf = require('rimraf');

import { createRpcClient } from '../create-rpc-client';
import { getRandomString } from '../get-random-string';
import { ModelPackagePath } from './model-package-path';
import { parsePackageUrl } from './parse-package-url';

const rimrafAsync = promisify(rimraf);

export async function downloadPackage(opts: { id: string; version: string }) {
  const rpcApi = createRpcClient();
  const { packageUrl } = await rpcApi.getModelVersion(opts);
  const { awsRegion, bucketName, bucketKey } = parsePackageUrl(packageUrl);
  const s3 = new S3({ apiVersion: '2006-03-01', region: awsRegion });
  const packagePath = ModelPackagePath(opts);

  await promisify(mkdirp)(dirname(packagePath));

  const downloadPath = `${packagePath}.${getRandomString()}.download`;

  try {
    await new Promise((resolve, reject) => {
      const writeable = createWriteStream(downloadPath);
      const readable = s3
        .getObject({ Key: bucketKey, Bucket: bucketName })
        .createReadStream();

      pump(readable, writeable, err => {
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
