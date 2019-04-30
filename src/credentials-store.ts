import { join } from 'path';

import { ALWAYSAI_CONFIG_DIR, ConfigFile } from '@alwaysai/config-nodejs';
import * as t from 'io-ts';

const codec = t.type({
  email: t.string,
  idToken: t.string,
});

const ENOENT = {
  message: 'Authentication is required for this action. Please run "alwaysai user logIn"',
  code: 'TERSE',
};

const path = join(ALWAYSAI_CONFIG_DIR, 'alwaysai.credentials.json');

export const credentialsStore = ConfigFile({
  path,
  codec,
  ENOENT,
});
