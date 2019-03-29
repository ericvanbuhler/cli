import { createStringOption } from '@alwaysai/always-cli';
import { CLOUD_API_URL } from '@alwaysai/cloud-api';

export const cloudApiUrl = createStringOption({
  description: 'URL of the alwaysAI Cloud API',
  defaultValue: CLOUD_API_URL,
});
