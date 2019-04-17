import { show as appShow } from '../show';

const action: typeof appShow.action = async (args, options) => {
  const appConfig = await appShow.action(args, options);
  return appConfig.models || {};
};

export const showModels = {
  ...appShow,
  action,
};
