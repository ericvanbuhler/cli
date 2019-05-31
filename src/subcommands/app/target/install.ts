import LogSymbols = require('log-symbols');

import { createLeaf } from '@alwaysai/alwayscli';

import { appConfigFile } from '../../../app-config-file';
import { targetConfigFile } from './target-config-file';
import { spinOnPromise } from '../../../spin-on-promise';
import { JsSpawner } from '../../../spawner/js-spawner';
import { AppInstaller } from '../../../app-installer';
import { echo } from '../../../echo';

export const install = createLeaf({
  name: 'install',
  description: 'Install this application and its dependencies to the target',
  async action() {
    const appConfig = appConfigFile.read();
    const target = targetConfigFile.readSpawner();
    const targetConfig = targetConfigFile.read();
    const source = JsSpawner();
    await target.mkdirp();

    const appInstaller = AppInstaller(target);

    // Protocol-specific install steps
    switch (targetConfig.protocol) {
      case 'ssh:':
      case 'ssh+docker:': {
        await spinOnPromise(appInstaller.installSource(source), 'Application source');
      }
    }

    let hasModels = false;
    if (appConfig.models) {
      const ids = Object.keys(appConfig.models);
      if (ids.length > 0) {
        hasModels = true;
        await spinOnPromise(
          appInstaller.installModels(appConfig.models),
          `Model${ids.length > 1 ? 's' : ''} ${ids.join(' ')}`,
        );
      }
    }

    if (!hasModels) {
      echo(`${LogSymbols.warning} Application has no models`);
    }

    await spinOnPromise(appInstaller.installVirtualenv(), 'Python virtualenv');
    await spinOnPromise(appInstaller.installPythonDeps(), 'Python dependencies');
  },
});
