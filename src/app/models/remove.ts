import { createLeaf, createStringArrayOption, withRequired } from '@alwaysai/always-cli';
import {
  APP_CONFIG_FILE_NAME,
  checkAppConfigFile,
  installModelsInAppConfigFile,
  removeModelFromAppConfigFile,
} from '../../app-config-file';
import { fakeSpinner } from '../../fake-spinner';

const names = withRequired(
  createStringArrayOption({
    description: 'Names of models to remove',
  }),
);

export const removeModels = createLeaf({
  commandName: 'remove',
  description: `Remove alwaysAI model(s) from this App`,
  options: {
    names,
  },
  async action({ names }) {
    checkAppConfigFile();
    for (const name of names) {
      await fakeSpinner(`Remove model "${name}"`);
      removeModelFromAppConfigFile(APP_CONFIG_FILE_NAME, name);
      installModelsInAppConfigFile(APP_CONFIG_FILE_NAME);
    }
    console.log('Done!');
  },
});
