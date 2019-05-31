import { createStringArrayInput } from '@alwaysai/alwayscli';

export const ids = createStringArrayInput({
  description: 'For example, "alwaysai/MobileNetSSD"',
  required: true,
  placeholder: '<id> [...]',
});
