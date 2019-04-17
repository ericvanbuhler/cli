import { createBranch } from '@alwaysai/always-cli';
import { addModels } from './add';
import { pullModels } from './pull';
import { removeModels } from './remove';
import { showModels } from './show';

export const models = createBranch({
  name: 'models',
  description: 'Manage models in an alwaysAI App',
  subcommands: [pullModels, showModels, addModels, removeModels],
});
