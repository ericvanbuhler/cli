import { createLeaf } from '@alwaysai/always-cli';
import {
  APP_CONFIG_FILE_NAME,
  checkAppConfigFile,
  installModelsInAppConfigFile,
  removeModelFromAppConfigFile,
} from '../../app-config-file';
import { fakeSpinner } from '../../fake-spinner';
import { ids } from './ids';

export const removeModels = createLeaf({
  commandName: 'remove',
  description: `Remove model(s) from this alwaysAI app`,
  namedInputs: {
    ids,
  },
  async action({ ids }) {
    checkAppConfigFile();
    for (const id of ids) {
      await fakeSpinner(`Remove model "${id}"`);
      removeModelFromAppConfigFile(APP_CONFIG_FILE_NAME, id);
      installModelsInAppConfigFile(APP_CONFIG_FILE_NAME);
    }
    console.log('Done!');
  },
});
