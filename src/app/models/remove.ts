import { createLeaf } from '@alwaysai/always-cli';
import { appConfigFile } from '../../app-config-file';
import { fakeSpinner } from '../../fake-spinner';
import { ids } from './ids';

export const removeModels = createLeaf({
  name: 'remove',
  description: `Remove model(s) from this alwaysAI app`,
  options: {},
  args: ids,
  async action(ids) {
    appConfigFile.read();
    for (const id of ids) {
      await fakeSpinner(`Removing model "${id}"`);
      appConfigFile.removeModel(id);
    }
    console.log('Done!');
  },
});
