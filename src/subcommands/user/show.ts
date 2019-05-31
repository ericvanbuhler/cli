import { createLeaf } from '@alwaysai/alwayscli';

import { getCurrentUser } from '../../cognito-auth';
import chalk from 'chalk';

export const userShow = createLeaf({
  name: 'show',
  description: 'Show the currently logged in user',
  options: {},
  async action() {
    const user = await getCurrentUser();
    return user ? `Logged in as ${chalk.bold(user.getUsername())}` : 'Not logged in';
  },
});
