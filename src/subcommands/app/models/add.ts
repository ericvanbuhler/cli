import { createLeaf, TerseError } from '@alwaysai/alwayscli';
import { ErrorCode } from '@alwaysai/cloud-api';

import { appConfigFile } from '../../../app-config-file';
import { ids } from '../../../inputs/ids';
import { RpcClient } from '../../../rpc-client';
import { spinOnPromise } from '../../../spin-on-promise';
import { echo } from '../../../echo';

export const addModels = createLeaf({
  name: 'add',
  description: 'Add one or more alwaysAI models to this app',
  args: ids,
  async action(ids) {
    appConfigFile.read();
    const rpcClient = await RpcClient();
    const checked: [string, string][] = [];
    for (const id of ids) {
      try {
        const { version } = await spinOnPromise(
          rpcClient.getModelVersion({ id }),
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
    echo('Here is your new model configuration:');
    echo();
    echo(newConfig);
  },
});
