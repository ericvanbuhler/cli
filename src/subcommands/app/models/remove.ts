import { createLeaf } from '@alwaysai/alwayscli';
import { appConfigFile } from '../../../app-config-file';
import { ids } from '../../../inputs/ids';
import logSymbols = require('log-symbols');

export const removeModels = createLeaf({
  name: 'remove',
  description: `Remove model(s) from this alwaysAI app`,
  options: {},
  args: ids,
  async action(ids) {
    appConfigFile.read();
    for (const id of ids) {
      appConfigFile.removeModel(id);
      console.log(`${logSymbols.success} Remove ${id}`);
    }
  },
});
