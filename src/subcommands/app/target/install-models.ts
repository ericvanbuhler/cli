import { join, dirname } from 'path';

import LogSymbols = require('log-symbols');

import { ModelId } from '../../../model-id';
import { AppConfig } from '../../../app-config-file';
import { MODEL_CONFIG_FILE_NAME } from '../../model/model-config-file';
import { spinOnPromise } from '../../../spin-on-promise';
import { getRandomString } from '../../../get-random-string';
import { Spawner } from '../../../spawner/types';
import { PackageStreamFromCache } from '../../../model-manager/package-stream-from-cache';

async function installOneModel(target: Spawner, id: string, version: string) {
  const result = { changed: false };
  const { publisher, name } = ModelId.parse(id);
  const modelDir = `models/${publisher}/${name}`;
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
    return result;
  }

  result.changed = true;

  const tmpId = getRandomString();
  const tmpDir = `tmp/${tmpId}`;
  await target.mkdirp(tmpDir);
  await target.untar(await PackageStreamFromCache({ id, version }), tmpDir);
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
  return result;
}

export async function installModels(target: Spawner, models: AppConfig['models']) {
  if (!models || Object.keys(models).length === 0) {
    console.log(`${LogSymbols.success} No models to install.`);
    return;
  }

  for (const [id, version] of Object.entries(models)) {
    await spinOnPromise(installOneModel(target, id, version), `Model ${id}`);
  }
}
