import { createBranch } from '@alwaysai/alwayscli';

import { userLogin } from './login';
import { userLogout } from './logout';
import { userShow } from './show';

export const user = createBranch({
  name: 'user',
  description: 'Log in or log out of the alwaysAI cloud',
  subcommands: [userLogin, userLogout, userShow],
});
