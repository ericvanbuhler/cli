import { createLeaf, TerseError } from '@alwaysai/always-cli';
import { ErrorCode } from '@alwaysai/cloud-api';

import { appConfigFile } from '../../../app-config-file';
import { ModelId } from '../../../model-id';
import { ids } from '../../../inputs/ids';
import { createRpcClient } from '../../../create-rpc-client';
import { spinOnPromise } from '../../../spin-on-promise';

export const addModels = createLeaf({
  name: 'add',
  description: 'Add one or more alwaysAI models to this app',
  args: ids,
  async action(ids) {
    appConfigFile.read();
    const rpcClient = createRpcClient();
    const checked: [string, string][] = [];
    for (const id of ids) {
      const { publisher, name } = ModelId.parse(id);
      try {
        const { version } = await spinOnPromise(
          rpcClient.getModelVersion({ name, publisher }),
          `Checking model "${id}"`,
        );
        checked.push([id, version]);
      } catch (ex) {
        if (ex.code === ErrorCode.MODEL_VERSION_NOT_FOUND) {
          throw new TerseError(`Model not found: "${id}"`);
        }
        throw ex;
      }
    }
    checked.forEach(([id, version]) => {
      appConfigFile.addModel(id, version);
    });

    const newConfig = appConfigFile.read();
    console.log('Here is your new model configuration:');
    console.log();
    console.log(newConfig);
  },
});
