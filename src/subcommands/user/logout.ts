import { createLeaf } from '@alwaysai/alwayscli';

import { CognitoAuth } from '../../cognito-auth';

export const userLogout = createLeaf({
  name: 'logout',
  description: 'Log out of the alwaysAI Cloud',
  options: {},
  async action() {
    try {
      await CognitoAuth.signOut();
      return 'Logged out successfully';
    } catch {
      return 'An error occurred logging out';
    }
  },
});
