import { createLeaf } from '@alwaysai/always-cli';
import { PROJECT_FILE_NAME, readProjectFile } from '../project-file';

export const show = createLeaf({
  commandName: 'show',
  description: 'Show the alwaysAI project for the current directory',
  options: {},
  action() {
    try {
      const project = readProjectFile(PROJECT_FILE_NAME);
      return project;
    } catch (ex) {
      if (ex.code === 'ENOENT') {
        return 'The current directory is not an alwaysAI project';
      }
      throw ex;
    }
  },
});
