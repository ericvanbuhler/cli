import { createBranch } from '@alwaysai/always-cli';
import { addModels } from './add';
import { removeModels } from './remove';
import { showModels } from './show';
import { appModelsInstall } from './install';

export const models = createBranch({
  name: 'models',
  description: 'Manage models in an alwaysAI App',
  subcommands: [showModels, addModels, removeModels, appModelsInstall],
});
