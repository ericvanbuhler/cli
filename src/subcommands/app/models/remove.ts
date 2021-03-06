import { createLeaf } from '@alwaysai/alwayscli';
import { appConfigFile } from '../../../app-config-file';
import { fakeSpinner } from '../../../fake-spinner';
import { ids } from '../../../inputs/ids';

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
