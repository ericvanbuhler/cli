import { readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import origin = require('remote-origin-url');

import { createLeaf, TerseError } from '@alwaysai/alwayscli';

import { yes } from '../../inputs/yes';
import { appConfigFile } from '../../app-config-file';
import { prompt, checkTerminalIsInteractive } from '../../prompt';
import { ASSETS_DIR } from '../../constants';
import { echo } from '../../echo';

const APP_PY = readFileSync(join(ASSETS_DIR, 'app.py'), {
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
    if (!yes) {
      checkTerminalIsInteractive();
    }

    if (appConfigFile.exists()) {
      throw new TerseError("You're already in an alwaysAI application directory!");
    }

    echo(
      'Welcome! This command will initialize this directory as an alwaysAI application.',
    );
    echo();

    const defaultConfig: AppConfig = {
      name: basename(process.cwd()),
      version: '0.0.0',
      models: {},
      scripts: {
        start: 'python app.py',
      },
      repository: origin.sync(),
    };

    if (yes) {
      appConfigFile.write(defaultConfig);
    } else {
      const answers = await prompt([
        {
          type: 'text',
          name: 'name',
          message: 'Application name',
          initial: defaultConfig.name,
        },
        {
          type: 'text',
          name: 'version',
          message: 'Application version',
          initial: defaultConfig.version,
        },
        {
          type: 'text',
          name: 'startCommand',
          message: 'Command for starting the application',
          initial: defaultConfig.scripts!.start,
        },
      ]);
      const { startCommand, name, version } = answers;
      const scripts: AppConfig['scripts'] = {};
      if (startCommand) {
        scripts.start = startCommand;
      }
      appConfigFile.write({
        name,
        version,
        scripts,
        models: {},
      });
    }
    echo(`Wrote ${basename(appConfigFile.path)}`);
    try {
      writeFileSync('app.py', APP_PY, { flag: 'wx' });
      echo('Wrote app.py');
    } catch (ex) {
      if (ex.code !== 'EEXIST') {
        throw ex;
      }
      echo('Found app.py');
    }
  },
});
