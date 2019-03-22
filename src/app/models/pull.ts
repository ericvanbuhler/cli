import { createLeaf } from '@alwaysai/always-cli';
import {
  APP_CONFIG_FILE_NAME,
  checkProjectFile,
  installModelsInProjectFile,
} from '../../project-file';
import { fakeSpinner } from '../../fake-spinner';

export const pullModels = createLeaf({
  commandName: 'pull',
  description: "Download this project's models",
  options: {},
  async action() {
    checkProjectFile();
    await fakeSpinner('Downloading models');
    installModelsInProjectFile(APP_CONFIG_FILE_NAME);
    console.log('Done!');
  },
});
