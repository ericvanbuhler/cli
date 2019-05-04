import { createBranch } from '@alwaysai/alwayscli';
import { addModels } from './add';
import { removeModels } from './remove';
import { showModels } from './show';

export const models = createBranch({
  name: 'models',
  description: 'Manage models in an alwaysAI App',
  subcommands: [showModels, addModels, removeModels],
});
