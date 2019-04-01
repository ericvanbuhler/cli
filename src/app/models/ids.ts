import { createStringArrayInput } from '@alwaysai/always-cli';

export const ids = createStringArrayInput({
  description: 'IDs of the models, e.g. "@alwaysai/mobilenet-ssd"',
  required: true,
});
