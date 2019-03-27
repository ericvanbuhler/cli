import { NOT_FOUND } from 'http-status-codes';

import {
  createLeaf,
  withRequired,
  FatalError,
  createStringArrayOption,
} from '@alwaysai/always-cli';
import { createRpcClient, CredentialsStore } from '@alwaysai/cloud-api-nodejs';
import { cloudApiUrl } from '@alwaysai/cloud-api-nodejs/lib/cli';

import {
  APP_CONFIG_FILE_NAME,
  checkAppConfigFile,
  addModelToAppConfigFile,
  installModelsInAppConfigFile,
} from '../../app-config-file';
import { fakeSpinner } from '../../fake-spinner';
import { checkLoggedIn } from '../../check-logged-in';
import { ModelId } from '../../model-id';

const ids = withRequired(
  createStringArrayOption({
    description: 'IDs of the models, e.g. "@alwaysai/mobilenet-ssd"',
  }),
);

export const addModels = createLeaf({
  commandName: 'add',
  description: 'Add one or more alwaysAI models to this app',
  options: {
    ids,
    cloudApiUrl,
  },
  async action({ ids, cloudApiUrl }) {
    checkAppConfigFile();
    checkLoggedIn();
    const store = new CredentialsStore();
    const credentials = store.read();
    const rpcClient = createRpcClient({ credentials, cloudApiUrl });
    for (const id of ids) {
      const { publisher, name } = ModelId.parse(id);
      try {
        await rpcClient.getModel({ name, publisher });
      } catch (ex) {
        if (ex.code === NOT_FOUND) {
          throw new FatalError(`Model not found: "${id}"`);
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
