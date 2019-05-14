import { existsSync, rename, createReadStream } from 'fs';
import { join, dirname } from 'path';
import { promisify } from 'util';
import { homedir } from 'os';
import { Readable } from 'stream';

import LogSymbols = require('log-symbols');
import rimraf = require('rimraf');
import download = require('download');
import difference = require('lodash.difference');

import { createLeaf } from '@alwaysai/alwayscli';

import { ModelId } from '../../../model-id';
import { createRpcClient } from '../../../create-rpc-client';
import { appConfigFile, AppConfig } from '../../../app-config-file';
import { targetConfigFile } from './target-config-file';
import { MODEL_CONFIG_FILE_NAME } from '../../model/model-config-file';
import { spinOnPromise } from '../../../spin-on-promise';
import { JsSpawner } from '../../../spawner/js-spawner';
import { getRandomString } from '../../../get-random-string';
import { Spawner } from '../../../spawner/types';

const rimrafAsync = promisify(rimraf);
const DOT_ALWAYSAI_DIR = join(homedir(), '.alwaysai');
const MODEL_PACKAGE_CACHE_DIR = join(DOT_ALWAYSAI_DIR, 'model-package-cache');
const REQUIREMENTS_FILE_NAME = 'requirements.txt';
const VENV_ROOT = 'venv';
const IGNORED_FILE_NAMES = ['models', 'node_modules', '.git'];

export const install = createLeaf({
  name: 'install',
  description: 'Install this application and its dependencies to the target',
  async action() {
    const appConfig = appConfigFile.read();
    const target = targetConfigFile.readSpawner();
    const targetConfig = targetConfigFile.read();
    const source = JsSpawner();
    await target.mkdirp();

    if (targetConfig.protocol === 'ssh:') {
      async function copyApplicationCode() {
        const allFileNames = await source.readdir();
        const filteredFileNames = difference(allFileNames, IGNORED_FILE_NAMES);
        const readable = await source.tar(...filteredFileNames);
        await target.untar(readable);
      }
      await spinOnPromise(copyApplicationCode(), 'Transfer application');
    } else {
      console.log(`${LogSymbols.success} Application code`);
    }

    await installModels(target, appConfig.models);

    try {
      await spinOnPromise(
        target.run({
          exe: 'virtualenv',
          args: ['--system-site-packages', VENV_ROOT],
          cwd: '.',
        }),
        'Python virtualenv',
      );
    } catch (ex) {
      throw ex;
      // TODO: More fine-grained error handling
      // throw new TerseError('Target does not have virtualenv installed!');
    }

    if (existsSync(REQUIREMENTS_FILE_NAME)) {
      await spinOnPromise(
        target.run({
          exe: `${VENV_ROOT}/bin/pip`,
          args: ['install', '-r', REQUIREMENTS_FILE_NAME],
          cwd: '.',
        }),
        'Python dependencies',
      );
    } else {
      console.log(`${LogSymbols.success} No ${REQUIREMENTS_FILE_NAME} to install`);
    }
  },
});

async function installModels(target: Spawner, models: AppConfig['models']) {
  if (!models || Object.keys(models).length === 0) {
    console.log(`${LogSymbols.success} No models to install.`);
    return;
  }
  const rpc = createRpcClient();
  async function installOneModel(id: string, version: string) {
    const returnValue = { changed: false };
    const { publisher, name } = ModelId.parse(id);
    const modelDir = `models/@${publisher}/${name}`;
    let installedVersion: string | undefined = undefined;
    try {
      const output = await target.run({
        exe: 'cat',
        args: [`${modelDir}/${MODEL_CONFIG_FILE_NAME}`],
        cwd: '.',
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
    const tmpId = getRandomString();
    const tmpDir = `tmp/${tmpId}`;
    await target.mkdirp(tmpDir);
    await target.untar(modelPackageStream, tmpDir);
    const fileNames = await target.readdir(tmpDir);
    const fileName = fileNames[0];
    if (!fileName) {
      throw new Error('Expected package to contain a directory');
    }
    await target.rimraf(modelDir);
    await target.mkdirp(dirname(modelDir));
    await target.run({
      exe: 'mv',
      args: [join(tmpDir, fileName), modelDir],
      cwd: '.',
    });
    return returnValue;
  } // End of install one

  for (const [id, version] of Object.entries(models)) {
    await spinOnPromise(installOneModel(id, version), `Model ${id}`);
  }
}
