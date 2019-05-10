import { isAbsolute } from 'path';
import { createStringInput, UsageError, createOneOfInput } from '@alwaysai/alwayscli';

import { yes } from '../../../../inputs/yes';
import { TARGET_PROTOCOLS } from '../../../../target-protocol';

export function validatePath(value: string) {
  return !value
    ? 'Value is required'
    : value === '/'
    ? 'The filesystem root "/" is not a valid target directory'
    : !isAbsolute(value)
    ? 'Value must be an absolute path'
    : undefined;
}

const path = createStringInput({
  description: 'Absolute path for the application on the target system',
});
const originalGetValue = path.getValue;
path.getValue = async argv => {
  const path = await originalGetValue(argv);
  if (typeof path === 'undefined') {
    return path;
  }
  const errorMessage = validatePath(path);
  if (errorMessage) {
    throw new UsageError(errorMessage);
  }
  return path;
};

export const options = {
  yes,
  protocol: createOneOfInput({
    values: TARGET_PROTOCOLS,
  }),
  hostname: createStringInput({
    description: 'Hostname or IP address',
  }),
  path,
};
