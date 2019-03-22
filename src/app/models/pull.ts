import { createLeaf } from '@alwaysai/always-cli';
import {
  APP_CONFIG_FILE_NAME,
  checkAppConfigFile,
  installModelsInAppConfigFile,
} from '../../app-config-file';
import { fakeSpinner } from '../../fake-spinner';

export const pullModels = createLeaf({
  commandName: 'pull',
  description: "Download this app's models",
  options: {},
  async action() {
    checkAppConfigFile();
    await fakeSpinner('Downloading models');
    installModelsInAppConfigFile(APP_CONFIG_FILE_NAME);
    console.log('Done!');
  },
});
