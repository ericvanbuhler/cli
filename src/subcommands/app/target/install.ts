import { existsSync, rename, createReadStream } from 'fs';
import { join, dirname } from 'path';
import { promisify } from 'util';
import { homedir } from 'os';
import { Readable } from 'stream';

import rimraf = require('rimraf');
import download = require('download');

import { createLeaf } from '@alwaysai/always-cli';

import { ModelId } from '../../../model-id';
import { createRpcClient } from '../../../create-rpc-client';
import { appConfigFile } from '../../../app-config-file';
import { targetConfigFile } from './target-config-file';
import { createTarbombStream } from '../../../create-tarbomb-stream';
import { MODEL_CONFIG_FILE_NAME } from '../../model/model-config-file';
import { spinOnPromise } from '../../../spin-on-promise';

const rimrafAsync = promisify(rimraf);
const DOT_ALWAYSAI_DIR = join(homedir(), '.alwaysai');
const MODEL_PACKAGE_CACHE_DIR = join(DOT_ALWAYSAI_DIR, 'model-package-cache');

export const install = createLeaf({
  name: 'install',
  description: 'Install this application and its dependencies to the target',
  async action() {
    const appConfig = appConfigFile.read();

    const sshClient = await targetConfigFile.connectToTarget();
    await sshClient.mkdirp();

    const tarbombStream = createTarbombStream(process.cwd());
    await spinOnPromise(
      sshClient.runCommand('tar xz -', { input: tarbombStream, cwd: '.' }),
      'Copying application',
    );

    const { models } = appConfig;
    if (!models || Object.keys(models).length === 0) {
      spinOnPromise(Promise.resolve(), 'No models to install');
      return;
    }
    const rpc = createRpcClient();
    async function installModel(id: string, version: string) {
      const returnValue = { changed: false };
      const { publisher, name } = ModelId.parse(id);
      const modelDir = `models/@${publisher}/${name}`;
      let installedVersion: string | undefined = undefined;
      try {
        const { stdout } = await sshClient.runCommand(
          `cat ${modelDir}/${MODEL_CONFIG_FILE_NAME}`,
        );
        const parsed = JSON.parse(stdout);
        installedVersion = parsed.version;
      } catch (_) {
        // TODO finer-grained error handling
      }

      if (installedVersion === version) {
        return returnValue;
      }

      returnValue.changed = true;

      const modelPackageFileName = `${publisher}-${name}-${version}.tar.gz`;
      const modelPackagePath = join(MODEL_PACKAGE_CACHE_DIR, modelPackageFileName);

      let modelPackageStream: Readable;
      if (existsSync(modelPackagePath)) {
        modelPackageStream = createReadStream(modelPackagePath);
      } else {
        // Package does not exist in cache. Let's download it.
        const { packageUrl } = await rpc.getModelVersion({
          name,
          publisher,
          version,
        });

        const downloadFileName = `${modelPackageFileName}.download`;
        const downloadFilePath = join(MODEL_PACKAGE_CACHE_DIR, downloadFileName);
        await rimrafAsync(downloadFilePath);
        try {
          await download(packageUrl, MODEL_PACKAGE_CACHE_DIR, {
            extract: false,
            filename: downloadFileName,
          });
          await promisify(rename)(downloadFilePath, modelPackagePath);
          modelPackageStream = createReadStream(modelPackagePath);
        } finally {
          await rimrafAsync(downloadFilePath);
        }
      }
      const tmpDir = join(
        '.tmp',
        Math.random()
          .toString(36)
          .substring(2),
      );
      await sshClient.mkdirp(tmpDir);
      await sshClient.runCommand('tar xz -', {
        input: modelPackageStream,
        cwd: tmpDir,
      });
      await sshClient.rimraf(modelDir);
      await sshClient.mkdirp(dirname(modelDir));
      await sshClient.runCommand(`mv "${tmpDir}"/* "${modelDir}"`);
      return returnValue;
    } // End of install one

    for (const [id, version] of Object.entries(models)) {
      await spinOnPromise(installModel(id, version), `Installing model ${id}`);
    }
  },
});
