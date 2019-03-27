import { existsSync, readFileSync } from 'fs';
import { basename } from 'path';

import origin = require('remote-origin-url');
import prompts = require('prompts');

import { createLeaf, FatalError } from '@alwaysai/always-cli';
import { yes } from './yes';
import { writeAppConfigFile, APP_CONFIG_FILE_NAME, AppConfig } from '../app-config-file';
import { checkLoggedIn } from '../check-logged-in';

export const init = createLeaf({
  commandName: 'init',
  description: 'Initialize an alwaysAI project in the current directory',
  options: {
    yes,
  },
  async action({ yes }) {
    const username = checkLoggedIn();

    if (existsSync(APP_CONFIG_FILE_NAME)) {
      const fileContents = readFileSync(APP_CONFIG_FILE_NAME, { encoding: 'utf8' });
      const lines = [
        "You're already in an alwaysAI app directory!",
        '',
        `Your ${APP_CONFIG_FILE_NAME} is:`,
        fileContents,
      ];
      throw new FatalError(lines.join('\n'));
    }

    const defaultConfig: AppConfig = {
      name: `@${username}/${basename(process.cwd())}`,
      version: '0.0.0-0',
      models: {},
      repository: origin.sync(),
    };

    let fileContents: string;
    if (yes) {
      fileContents = writeAppConfigFile(APP_CONFIG_FILE_NAME, defaultConfig);
    } else {
      const answers = await prompts([
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
          message: 'repository',
          initial: defaultConfig.repository,
        },
      ]);
      fileContents = writeAppConfigFile(APP_CONFIG_FILE_NAME, {
        ...answers,
        models: {},
      });
    }
    return `Wrote to ${APP_CONFIG_FILE_NAME}:\n\n${fileContents}`;
  },
});
