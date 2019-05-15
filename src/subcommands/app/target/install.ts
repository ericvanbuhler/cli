import { existsSync } from 'fs';

import LogSymbols = require('log-symbols');
import difference = require('lodash.difference');

import { createLeaf } from '@alwaysai/alwayscli';

import { appConfigFile } from '../../../app-config-file';
import { targetConfigFile } from './target-config-file';
import { spinOnPromise } from '../../../spin-on-promise';
import { JsSpawner } from '../../../spawner/js-spawner';
import { IGNORED_FILE_NAMES } from '../../../constants';
import { installModels } from './install-models';

const REQUIREMENTS_FILE_NAME = 'requirements.txt';
const VENV_ROOT = 'venv';

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
