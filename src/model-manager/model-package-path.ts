import { join } from 'path';

import { ModelId } from '../model-id';
import { MODEL_PACKAGE_CACHE_DIR } from '../constants';

export function ModelPackagePath(opts: { id: string; version: string }) {
  const { publisher, name } = ModelId.parse(opts.id);
  return join(MODEL_PACKAGE_CACHE_DIR, `${publisher}-${name}-${opts.version}.tar.gz`);
}
