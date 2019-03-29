import { createStringArrayOption } from '@alwaysai/always-cli';

export const ids = createStringArrayOption({
  description: 'IDs of the models, e.g. "@alwaysai/mobilenet-ssd"',
  required: true,
});
