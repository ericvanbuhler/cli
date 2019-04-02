import { NOT_FOUND } from 'http-status-codes';

import { createLeaf, TerseError } from '@alwaysai/always-cli';
import { createRpcClient, CredentialsStore } from '@alwaysai/cloud-api-nodejs';

import { cloudApi } from '../../cloud-api';
import {
  APP_CONFIG_FILE_NAME,
  checkAppConfigFile,
  addModelToAppConfigFile,
  installModelsInAppConfigFile,
} from '../../app-config-file';
import { checkLoggedIn } from '../../check-logged-in';
import { ModelId } from '../../model-id';
import { ids } from './ids';
import { fakeSpinner } from '../../fake-spinner';

export const addModels = createLeaf({
  name: 'add',
  description: 'Add one or more alwaysAI models to this app',
  options: {
    cloudApi,
  },
  args: ids,
  async action(ids, { cloudApi }) {
    checkAppConfigFile();
    checkLoggedIn();
    const store = new CredentialsStore();
    const credentials = store.read();
    const rpcClient = createRpcClient({ credentials, cloudApiUrl: cloudApi });
    for (const id of ids) {
      const { publisher, name } = ModelId.parse(id);
      try {
        await rpcClient.getModel({ name, publisher });
      } catch (ex) {
        if (ex.code === NOT_FOUND) {
          throw new TerseError(`Model not found: "${id}"`);
        }
        throw ex;
      }
      await fakeSpinner(`Adding model "${id}"`);
      addModelToAppConfigFile(APP_CONFIG_FILE_NAME, id);
      installModelsInAppConfigFile(APP_CONFIG_FILE_NAME);
    }
    console.log('Done!');
  },
});
