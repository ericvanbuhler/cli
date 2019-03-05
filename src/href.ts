import { withDefaultValue, createStringOption } from '@alwaysai/always-cli';

export const href = withDefaultValue(
  createStringOption({
    description: 'URL href for the Web API',
  }),
  'https://alwaysai-dev.appspot.com/',
);
