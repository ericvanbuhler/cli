import LogSymbols = require('log-symbols');

import { createLeaf } from '@alwaysai/alwayscli';

import { appConfigFile } from '../../app-config-file';
import { spinOnPromise } from '../../spin-on-promise';
import { JsSpawner } from '../../spawner/js-spawner';
import { AppInstaller } from '../../app-installer';

export const appInstall = createLeaf({
  name: 'install',
  hidden: true,
  description: "Install this application's dependencies",
  async action() {
    const appConfig = appConfigFile.read();
    const target = JsSpawner();
    const appInstaller = AppInstaller(target);

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
      console.log(`${LogSymbols.warning} Application has no models`);
    }

    await spinOnPromise(appInstaller.installVirtualenv(), 'Python virtualenv');
    await spinOnPromise(appInstaller.installPythonDeps(), 'Python dependencies');
  },
});
