import { createLeaf, createStringArrayOption, withRequired } from '@alwaysai/always-cli';
import {
  APP_CONFIG_FILE_NAME,
  checkProjectFile,
  installModelsInProjectFile,
  removeModelFromProjectFile,
} from '../../project-file';
import { fakeSpinner } from '../../fake-spinner';

const names = withRequired(
  createStringArrayOption({
    description: 'Names of models to remove',
  }),
);

export const removeModels = createLeaf({
  commandName: 'remove',
  description: `Remove alwaysAI model(s) from this project`,
  options: {
    names,
  },
  async action({ names }) {
    checkProjectFile();
    for (const name of names) {
      await fakeSpinner(`Remove model "${name}"`);
      removeModelFromProjectFile(APP_CONFIG_FILE_NAME, name);
      installModelsInProjectFile(APP_CONFIG_FILE_NAME);
    }
    console.log('Done!');
  },
});
