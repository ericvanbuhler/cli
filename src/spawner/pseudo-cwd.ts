import { isAbsolute, resolve } from 'path';

// State machine for resolving paths
export function PseudoCwd(path: string) {
  if (!isAbsolute(path)) {
    throw new Error('path must be absolute');
  }
  let state = path;

  return {
    toAbsolute,
    cd(path?: string) {
      state = toAbsolute(path);
    },
    cwd() {
      return state;
    },
  };

  function toAbsolute(path?: string) {
    if (!path) {
      return state;
    }
    return isAbsolute(path) ? path : resolve(state, path);
  }
}
