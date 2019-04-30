import { createLeaf, TerseError } from '@alwaysai/always-cli';

import { ModelId } from '../../../model-id';
import { createRpcClient } from '../../../create-rpc-client';
import { spinOnPromise } from '../../../spin-on-promise';
import { ErrorCode } from '@alwaysai/cloud-api';
import { appConfigFile } from '../../../app-config-file';
import chalk from 'chalk';
import download = require('download');
import { existsSync, rename } from 'fs';
import { join, dirname } from 'path';
import { promisify } from 'util';
import mkdirp = require('mkdirp');
import rimraf = require('rimraf');

const rimrafAsync = promisify(rimraf);

export const appModelsInstall = createLeaf({
  name: 'install',
  description: 'Install alwaysAI models',
  async action() {
    const appConfig = appConfigFile.read();
    const { models } = appConfig;
    if (!models || Object.keys(models).length === 0) {
      console.log(
        `Nothing to install! Use ${chalk.bold('alwaysai app models add')} to add models.`,
      );
      return;
    }
    const rpcClient = createRpcClient();
    for (const [id, version] of Object.entries(models)) {
      const { publisher, name } = ModelId.parse(id);
      console.log(`${id}:`);
      try {
        const { packageUrl } = await spinOnPromise(
          rpcClient.getModelVersion({ name, publisher, version }),
          `Fetching metadata`,
        );
        const dir = join(process.cwd(), 'models', `@${publisher}`, name);
        if (!existsSync(dir)) {
          const downloadDir = `${dir}.download`;
          await rimrafAsync(downloadDir);
          try {
            await spinOnPromise(
              download(packageUrl, downloadDir, {
                extract: true,
              }),
              'Downloading',
            );
            const extractedDir = join(downloadDir, name);
            await spinOnPromise(promisify(mkdirp)(dirname(dir)), 'Extracting');
            await promisify(rename)(extractedDir, dir);
          } finally {
            await rimrafAsync(downloadDir);
          }
        }
      } catch (ex) {
        if (ex.code === ErrorCode.MODEL_VERSION_NOT_FOUND) {
          throw new TerseError(`Model not found: "${id}"`);
        }
        throw ex;
      }
      console.log('Done!');
    }
  },
});
