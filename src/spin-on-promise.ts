import ora = require('ora');

export function spinOnPromise(...args: Parameters<typeof ora.promise>) {
  const promise = args[0];
  const opts = args[1];
  ora.promise(promise, opts);
  return promise;
}
