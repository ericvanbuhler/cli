import { createStringInput } from '@alwaysai/alwayscli';
import { CLOUD_API_URL } from '@alwaysai/cloud-api';

export const cloudApi = createStringInput({
  placeholder: '<url>',
  description: 'WHATWG URL of an alwaysAI Cloud API',
  defaultValue: CLOUD_API_URL,
});
