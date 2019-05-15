import { createReadStream, existsSync } from 'fs';
import { ModelPackagePath } from './model-package-path';
import { downloadPackage } from './download-package';

export async function PackageStreamFromCache(opts: { id: string; version: string }) {
  const modelPackagePath = ModelPackagePath(opts);
  if (!existsSync(modelPackagePath)) {
    await downloadPackage(opts);
  }
  return createReadStream(modelPackagePath);
}
