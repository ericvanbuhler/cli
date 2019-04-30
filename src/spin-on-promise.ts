import ora = require('ora');

export function spinOnPromise<T>(promise: Promise<T>, opts?: ora.Options | string) {
  ora.promise(promise, opts);
  return promise;
}
