import { createFlagInput } from '@alwaysai/always-cli';

export const yes = createFlagInput({
  description: 'Skip interactive prompts',
});
