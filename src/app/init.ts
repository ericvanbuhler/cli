import { existsSync, readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

import origin = require('remote-origin-url');
import prompts = require('prompts');

import { createLeaf, FatalError } from '@alwaysai/always-cli';
import { yes } from './yes';
import { writeAppConfigFile, APP_CONFIG_FILE_NAME, AppConfig } from '../app-config-file';
import { checkLoggedIn } from '../check-logged-in';

const APP_PY = readFileSync(join(__dirname, '..', '..', 'assets', 'app.py'), {
  encoding: 'utf8',
});

export const init = createLeaf({
  commandName: 'init',
  description: 'Initialize an alwaysAI project in the current directory',
  options: {
    yes,
  },
  async action({ yes }) {
    const username = checkLoggedIn();

    if (existsSync(APP_CONFIG_FILE_NAME)) {
      throw new FatalError("You're already in an alwaysAI app directory!");
    }

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
      writeAppConfigFile(APP_CONFIG_FILE_NAME, defaultConfig);
    } else {
      const answers = await prompts([
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
      ]);
      const { startCommand, name, publisher, repository, version } = answers;
      const scripts: AppConfig['scripts'] = {};
      if (startCommand) {
        scripts.start = startCommand;
      }
      writeAppConfigFile(APP_CONFIG_FILE_NAME, {
        publisher,
        name,
        version,
        scripts,
        models: {},
        repository,
      });
    }
    console.log(`Wrote ${APP_CONFIG_FILE_NAME}`);
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
