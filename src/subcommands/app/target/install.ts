import { existsSync, rename, createReadStream } from 'fs';
import { join, dirname } from 'path';
import { promisify } from 'util';
import { homedir } from 'os';
import { Readable } from 'stream';
import LogSymbols = require('log-symbols');
import rimraf = require('rimraf');
import download = require('download');

import { createLeaf } from '@alwaysai/alwayscli';

import { ModelId } from '../../../model-id';
import { createRpcClient } from '../../../create-rpc-client';
import { appConfigFile, AppConfig } from '../../../app-config-file';
import { targetConfigFile } from './target-config-file';
import { createTarbombStream } from '../../../create-tarbomb-stream';
import { MODEL_CONFIG_FILE_NAME } from '../../model/model-config-file';
import { spinOnPromise } from '../../../spin-on-promise';
import { Spawner } from '../../../spawner/child-spawner';

const rimrafAsync = promisify(rimraf);
const DOT_ALWAYSAI_DIR = join(homedir(), '.alwaysai');
const MODEL_PACKAGE_CACHE_DIR = join(DOT_ALWAYSAI_DIR, 'model-package-cache');
const REQUIREMENTS_FILE_NAME = 'requirements.txt';
const VENV_ROOT = 'venv';

export const install = createLeaf({
  name: 'install',
  description: 'Install this application and its dependencies to the target',
  async action() {
    const appConfig = appConfigFile.read();
    const spawner = targetConfigFile.readSpawner();
    const targetConfig = targetConfigFile.read();
    await spawner.mkdirp('.');

    if (targetConfig.protocol === 'ssh:') {
      await spinOnPromise(
        spawner.untar(createTarbombStream(process.cwd())),
        'Copy application code',
      );
    } else {
      // protocol == 'docker:'
      console.log(`${LogSymbols.success} Mount application volume`);
    }
    try {
      await spinOnPromise(
        spawner.runCommand({
          exe: 'virtualenv',
          args: ['--system-site-packages', VENV_ROOT],
          path: '.',
        }),
        'Install python virtualenv',
      );
    } catch (ex) {
      throw ex;
      // TODO: More fine-grained error handling
      // throw new TerseError('Target does not have virtualenv installed!');
    }

    await installModels(spawner, appConfig.models);

    if (existsSync(REQUIREMENTS_FILE_NAME)) {
      await spinOnPromise(
        spawner.runCommand({
          exe: `${VENV_ROOT}/bin/pip`,
          args: ['install', '-r', REQUIREMENTS_FILE_NAME],
          path: '.',
        }),
        'Installing Python dependencies',
      );
    } else {
      console.log(`${LogSymbols.success} No ${REQUIREMENTS_FILE_NAME} to install`);
    }
  },
});

async function installModels(spawner: Spawner, models: AppConfig['models']) {
  if (!models || Object.keys(models).length === 0) {
    console.log(`${LogSymbols.success} No models to install.`);
    return;
  }
  const rpc = createRpcClient();
  async function installOneModel(id: string, version: string) {
    const returnValue = { changed: false };
    const { publisher, name } = ModelId.parse(id);
    const modelDir = spawner.toAbsolute(`models/@${publisher}/${name}`);
    let installedVersion: string | undefined = undefined;
    try {
      const output = await spawner.runCommand({
        exe: 'cat',
        args: [`${modelDir}/${MODEL_CONFIG_FILE_NAME}`],
        path: '.',
      });
      const parsed = JSON.parse(output);
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
    const tmpId = Math.random()
      .toString(36)
      .substring(2);
    const tmpDir = spawner.toAbsolute(`tmp/${tmpId}`);
    await spawner.mkdirp(tmpDir);
    await spawner.untar(modelPackageStream, tmpDir);
    const output = await spawner.runCommand({ exe: 'ls', path: tmpDir });
    const fileName = output.trim();
    await spawner.rimraf(modelDir);
    await spawner.mkdirp(dirname(modelDir));
    await spawner.runCommand({
      exe: 'mv',
      args: [join(tmpDir, fileName), modelDir],
    });
    return returnValue;
  } // End of install one

  for (const [id, version] of Object.entries(models)) {
    await spinOnPromise(installOneModel(id, version), `Install model ${id}`);
  }
}
