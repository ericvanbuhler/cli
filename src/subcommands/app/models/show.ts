import { show as appShow } from '../show';

export const showModels: typeof appShow = {
  ...appShow,
  description: 'Show this application\'s "models" configuration',
  async action(args, options) {
    const appConfig = await appShow.action(args, options);
    return appConfig.models || {};
  },
};
