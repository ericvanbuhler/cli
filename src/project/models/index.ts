import { createBranch } from '@alwaysai/always-cli';
import { addModels } from './add';
import { pullModels } from './pull';
import { removeModels } from './remove';

export const models = createBranch({
  commandName: 'models',
  description: 'Manage models in an alwaysAI project',
  subcommands: [pullModels, addModels, removeModels],
});
