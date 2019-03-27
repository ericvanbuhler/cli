import { createLeaf, createStringArrayOption, withRequired } from '@alwaysai/always-cli';
import {
  APP_CONFIG_FILE_NAME,
  checkAppConfigFile,
  installModelsInAppConfigFile,
  removeModelFromAppConfigFile,
} from '../../app-config-file';
import { fakeSpinner } from '../../fake-spinner';

const ids = withRequired(
  createStringArrayOption({
    description: 'ID of the model(s) to remove',
  }),
);

export const removeModels = createLeaf({
  commandName: 'remove',
  description: `Remove model(s) from this alwaysAI app`,
  options: {
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
