import { createStringArrayInput } from '@alwaysai/alwayscli';

export const ids = createStringArrayInput({
  description: 'For example, "@alwaysai/mobilenet-ssd" "../my-model"',
  required: true,
  placeholder: '<id> [...]',
});
