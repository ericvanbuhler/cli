import { resolve, join } from 'path';
import { homedir } from 'os';

export const CLI_NAME = 'alwaysai';
export const PACKAGE_DIR = resolve(__dirname, '..');
export const ASSETS_DIR = join(PACKAGE_DIR, 'assets');
export const DOT_ALWAYSAI_DIR = join(homedir(), '.alwaysai');
export const MODEL_PACKAGE_CACHE_DIR = join(DOT_ALWAYSAI_DIR, 'model-package-cache');
export const AWS_REGION = 'us-west-2';
