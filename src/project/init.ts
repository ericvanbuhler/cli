import { createLeaf, FatalError } from '@alwaysai/always-cli';
import { yes } from './yes';
import { writeProjectFile, PROJECT_FILE_NAME, Project } from '../project-file';
import { existsSync, readFileSync } from 'fs';
import { basename } from 'path';
import origin = require('remote-origin-url');
import { checkLoggedIn } from '../credentials';
import prompts = require('prompts');

export const init = createLeaf({
  commandName: 'init',
  description: 'Initialize an alwaysAI project in the current directory',
  options: {
    yes,
  },
  async action({ yes }) {
    const { username } = checkLoggedIn();

    if (existsSync(PROJECT_FILE_NAME)) {
      const fileContents = readFileSync(PROJECT_FILE_NAME, { encoding: 'utf8' });
      const lines = [
        "You're already in an alwaysAI app directory!",
        '',
        `Your ${PROJECT_FILE_NAME} is:`,
        fileContents,
      ];
      throw new FatalError(lines.join('\n'));
    }

    const defaultConfig: Project = {
      name: `@${username}/${basename(process.cwd())}`,
      version: '0.0.0-0',
      models: {},
      repository: origin.sync(),
    };

    let fileContents: string;
    if (yes) {
      fileContents = writeProjectFile(PROJECT_FILE_NAME, defaultConfig);
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
      fileContents = writeProjectFile(PROJECT_FILE_NAME, {
        ...answers,
        models: {},
      });
    }
    return `Wrote to ${PROJECT_FILE_NAME}:\n\n${fileContents}`;
  },
});
