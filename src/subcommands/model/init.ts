import { basename } from 'path';

import { createLeaf, TerseError } from '@alwaysai/alwayscli';

import { yes } from '../../inputs/yes';
import { modelConfigFile } from './model-config-file';
import { checkTerminalIsInteractive } from '../../prompt';

type Config = Parameters<typeof modelConfigFile.write>[0];

export const init = createLeaf({
  name: 'init',
  description: 'Initialize this directory as an alwaysAI model',
  options: {
    yes,
  },
  async action(_, { yes }) {
    if (!yes) {
      checkTerminalIsInteractive();
    }

    if (modelConfigFile.exists()) {
      throw new TerseError("You're already in an alwaysAI model directory!");
    }

    console.log(
      'Welcome! This command will initialize this directory as an alwaysAI model.',
    );
    console.log();

    const defaultConfig: Config = {
      publisher: 'alwaysai',
      name: basename(process.cwd()),
      version: '0.0.0-0',
      accuracy: '',
      description: '',
      license: 'UNLICENSED',
      public: true,
      packageUrl: '',
      uuid: '',
    };

    modelConfigFile.write(defaultConfig);
    console.log(`Wrote ${basename(modelConfigFile.path)}`);
  },
});
