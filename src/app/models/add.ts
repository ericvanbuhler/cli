import { createLeaf, createStringArrayOption, withRequired } from '@alwaysai/always-cli';
import {
  APP_CONFIG_FILE_NAME,
  checkAppConfigFile,
  addModelToAppConfigFile,
  installModelsInAppConfigFile,
} from '../../app-config-file';
import { fakeSpinner } from '../../fake-spinner';

const names = withRequired(
  createStringArrayOption({
    description: 'Names of models to add',
  }),
);

export const addModels = createLeaf({
  commandName: 'add',
  description: 'Add alwaysAI model(s) to this app',
  options: {
    names,
  },
  async action({ names }) {
    checkAppConfigFile();
    for (const name of names) {
      await fakeSpinner(`Adding model "${name}"`);
      addModelToAppConfigFile(APP_CONFIG_FILE_NAME, name);
      installModelsInAppConfigFile(APP_CONFIG_FILE_NAME);
    }
    console.log('Done!');
  },
});
