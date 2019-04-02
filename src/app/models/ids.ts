import { createStringArrayInput } from '@alwaysai/always-cli';

export const ids = createStringArrayInput({
  description: 'For example, "@alwaysai/mobilenet-ssd" "../my-model"',
  required: true,
  placeholder: '<id> [...]',
});
