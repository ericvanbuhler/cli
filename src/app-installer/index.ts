import difference = require('lodash.difference');

import { Spawner } from '../spawner/types';
import { InstallModels } from './install-models';

const REQUIREMENTS_FILE_NAME = 'requirements.txt';
export const VENV = 'venv';
const IGNORED_FILE_NAMES = ['models', 'node_modules', '.git', 'venv'];

export function AppInstaller(target: Spawner) {
  const installModels = InstallModels(target);

  return {
    installSource,
    installModels,
    installVirtualenv,
    installPythonDeps,
  };

  async function installSource(source: Spawner) {
    const allFileNames = await source.readdir();
    const filteredFileNames = difference(allFileNames, IGNORED_FILE_NAMES);
    const readable = await source.tar(...filteredFileNames);
    await target.untar(readable);
  }

  async function installVirtualenv() {
    let changed = false;
    if (!(await target.exists(VENV))) {
      changed = true;
      await target.run({
        exe: 'virtualenv',
        args: ['--system-site-packages', VENV],
        cwd: '.',
      });
    }
    return { changed };
  }

  async function installPythonDeps() {
    let changed = false;
    if (await target.exists(REQUIREMENTS_FILE_NAME)) {
      changed = true;
      await target.run({
        exe: target.abs(VENV, 'bin', 'pip'),
        args: ['install', '--requirement', target.abs(REQUIREMENTS_FILE_NAME)],
      });
    }
    return changed;
  }
}
