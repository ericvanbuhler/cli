import { createLeaf } from '@alwaysai/always-cli';
import { appConfigFile } from '../../../app-config-file';
import { fakeSpinner } from '../../../fake-spinner';

export const pullModels = createLeaf({
  name: 'pull',
  description: "Download this app's models",
  options: {},
  async action() {
    appConfigFile.read();
    await fakeSpinner('Downloading models');
    console.log('Done!');
  },
});
