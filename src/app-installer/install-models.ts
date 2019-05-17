import { dirname } from 'path';

import { Spawner } from '../spawner/types';
import { ModelId } from '../model-id';
import { MODEL_CONFIG_FILE_NAME } from '../subcommands/model/model-config-file';
import { getRandomString } from '../get-random-string';
import { PackageStreamFromCache } from '../model-manager/package-stream-from-cache';
import { AppConfig } from '../app-config-file';

function runBestEffortBackgroundTask<T extends any[]>(
  fn: (...args: T) => any,
  ...args: T
) {
  (async () => {
    try {
      await fn(...args);
    } catch (ex) {}
  })();
}

export function InstallModels(spawner: Spawner) {
  return async function installModels(models: AppConfig['models']) {
    let changed = false;
    if (models) {
      await Promise.all(
        Object.entries(models).map(async ([id, version]) => {
          changed = changed || (await installModel(id, version)).changed;
        }),
      );
    }
    return { changed };
  };

  async function installModel(id: string, version: string) {
    let changed = false;
    const { publisher, name } = ModelId.parse(id);
    const modelDir = spawner.abs('models', publisher, name);
    let installedVersion: string | undefined = undefined;
    try {
      const output = await spawner.run({
        exe: 'cat',
        args: [spawner.abs(modelDir, MODEL_CONFIG_FILE_NAME)],
      });
      const parsed = JSON.parse(output);
      installedVersion = parsed.version;
    } catch (_) {
      // TODO finer-grained error handling
    }

    if (installedVersion !== version) {
      changed = true;
      const tmpId = getRandomString();
      const tmpDir = `${modelDir}.${tmpId}.download`;
      await spawner.mkdirp(tmpDir);
      try {
        await spawner.untar(await PackageStreamFromCache({ id, version }), tmpDir);
        const fileNames = await spawner.readdir(tmpDir);
        if (fileNames.length !== 1 || !fileNames[0]) {
          console.log(fileNames);
          throw new Error('Expected package to contain single directory');
        }
        await spawner.rimraf(modelDir);
        await spawner.mkdirp(dirname(modelDir));
        await spawner.run({
          exe: 'mv',
          args: [spawner.abs(tmpDir, fileNames[0]), modelDir],
        });
      } finally {
        runBestEffortBackgroundTask(spawner.rimraf, tmpDir);
      }
    }
    return { changed };
  }
}
