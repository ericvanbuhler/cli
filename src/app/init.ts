import { readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

import origin = require('remote-origin-url');
import prompts = require('prompts');

import { createLeaf, TerseError } from '@alwaysai/always-cli';
import { yes } from './yes';
import { appConfigFile } from '../app-config-file';
import { credentialsStore } from '../credentials-store';

const APP_PY = readFileSync(join(__dirname, '..', '..', 'assets', 'app.py'), {
  encoding: 'utf8',
});

type AppConfig = Parameters<typeof appConfigFile.write>[0];

export const init = createLeaf({
  name: 'init',
  description: 'Initialize this directory as an alwaysAI application',
  options: {
    yes,
  },
  async action(_, { yes }) {
    if (appConfigFile.exists()) {
      throw new TerseError("You're already in an alwaysAI app directory!");
    }
    const { username } = credentialsStore.read();

    const defaultConfig: AppConfig = {
      publisher: username,
      name: basename(process.cwd()),
      version: '0.0.0-0',
      models: {},
      scripts: {
        start: 'python app.py',
      },
      repository: origin.sync(),
    };

    if (yes) {
      appConfigFile.write(defaultConfig);
    } else {
      let canceled = false;
      const answers = await prompts(
        [
          {
            type: 'text',
            name: 'publisher',
            message: 'publisher',
            initial: defaultConfig.publisher,
          },
          {
            type: 'text',
            name: 'name',
            message: 'name',
            initial: defaultConfig.name,
          },
          {
            type: 'text',
            name: 'version',
            message: 'version',
            initial: defaultConfig.version,
          },
          {
            type: 'text',
            name: 'repository',
            message: 'git repository',
            initial: defaultConfig.repository,
          },
          {
            type: 'text',
            name: 'startCommand',
            message: 'start command',
            initial: defaultConfig.scripts!.start,
          },
        ],
        {
          onCancel() {
            canceled = true;
          },
        },
      );
      if (canceled) {
        return;
      }
      const { startCommand, name, publisher, repository, version } = answers;
      const scripts: AppConfig['scripts'] = {};
      if (startCommand) {
        scripts.start = startCommand;
      }
      appConfigFile.write({
        publisher,
        name,
        version,
        scripts,
        models: {},
        repository,
      });
    }
    console.log(`Wrote ${basename(appConfigFile.path)}`);
    try {
      writeFileSync('app.py', APP_PY, { flag: 'wx' });
      console.log('Wrote app.py');
    } catch (ex) {
      if (ex.code !== 'EEXIST') {
        throw ex;
      }
      console.log('Found app.py');
    }
  },
});
