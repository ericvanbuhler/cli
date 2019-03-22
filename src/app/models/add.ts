import { createLeaf, createStringArrayOption, withRequired } from '@alwaysai/always-cli';
import {
  APP_CONFIG_FILE_NAME,
  checkProjectFile,
  addModelToProjectFile,
  installModelsInProjectFile,
} from '../../project-file';
import { fakeSpinner } from '../../fake-spinner';

const names = withRequired(
  createStringArrayOption({
    description: 'Names of models to add',
  }),
);

export const addModels = createLeaf({
  commandName: 'add',
  description: 'Add alwaysAI model(s) to this project',
  options: {
    names,
  },
  async action({ names }) {
    checkProjectFile();
    for (const name of names) {
      await fakeSpinner(`Adding model "${name}"`);
      addModelToProjectFile(APP_CONFIG_FILE_NAME, name);
      installModelsInProjectFile(APP_CONFIG_FILE_NAME);
    }
    console.log('Done!');
  },
});
