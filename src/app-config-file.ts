import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import mkdirp = require('mkdirp');
import { FatalError } from '@alwaysai/always-cli';

export const APP_CONFIG_FILE_NAME = 'alwaysai.app.json';
export const MODELS_DIR_NAME = 'alwaysai.models';

export type AppConfig = Partial<{
  name: string;
  version: string;
  models: { [modelName: string]: string };
  repository: string;
}>;

export function readAppConfigFile(filePath: string) {
  const fileContents = readFileSync(filePath, { encoding: 'utf8' });
  const appConfig: AppConfig = JSON.parse(fileContents);
  return appConfig;
}

export function writeAppConfigFile(filePath: string, appConfig: AppConfig) {
  const fileContents = JSON.stringify(appConfig, null, 2);
  mkdirp.sync(dirname(filePath));
  writeFileSync(filePath, fileContents);
  return fileContents;
}

export function addModelToAppConfigFile(filePath: string, modelIdentifier: string) {
  const appConfig = readAppConfigFile(filePath);
  appConfig.models = appConfig.models || {};
  appConfig.models[modelIdentifier] = '*';
  writeAppConfigFile(filePath, appConfig);
}

export function removeModelFromAppConfigFile(filePath: string, name: string) {
  const appConfig = readAppConfigFile(filePath);
  if (appConfig.models) {
    delete appConfig.models[name];
  }
  writeAppConfigFile(filePath, appConfig);
}

export function checkAppConfigFile() {
  let config: ReturnType<typeof readAppConfigFile>;
  try {
    config = readAppConfigFile(APP_CONFIG_FILE_NAME);
  } catch (ex) {
    if (ex.code !== 'ENOENT') {
      throw ex;
    }
    throw new FatalError(
      `${APP_CONFIG_FILE_NAME} not found. Did you run "alwaysai app init"?`,
    );
  }
  return config;
}

export async function installModelsInAppConfigFile(filePath: string) {
  const config = readAppConfigFile(filePath);
  const appDir = dirname(filePath);
  const modelsDir = join(appDir, MODELS_DIR_NAME);
  mkdirp.sync(modelsDir);
  const { models } = config;
  if (models) {
    for (const [modelName, modelVersion] of Object.entries(models)) {
      mkdirp.sync(join(modelsDir, `${modelName}-${modelVersion}`));
    }
  }
}

export async function uninstallModels(_: string) {}
