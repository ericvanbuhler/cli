import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import mkdirp = require('mkdirp');
import { FatalError } from '@alwaysai/always-cli';

export const PROJECT_FILE_NAME = 'alwaysai.project.json';
export const MODELS_DIR_NAME = 'alwaysai.models';

export type Project = Partial<{
  name: string;
  version: string;
  models: { [modelName: string]: string };
  repository: string;
}>;

export function readProjectFile(filePath: string) {
  const fileContents = readFileSync(filePath, { encoding: 'utf8' });
  const project: Project = JSON.parse(fileContents);
  return project;
}

export function writeProjectFile(filePath: string, project: Project) {
  const fileContents = JSON.stringify(project, null, 2);
  mkdirp.sync(dirname(filePath));
  writeFileSync(filePath, fileContents);
  return fileContents;
}

export function addModelToProjectFile(filePath: string, name: string) {
  const project = readProjectFile(filePath);
  project.models = project.models || {};
  project.models[name] = '*';
  writeProjectFile(filePath, project);
}

export function removeModelFromProjectFile(filePath: string, name: string) {
  const project = readProjectFile(filePath);
  if (project.models) {
    delete project.models[name];
  }
  writeProjectFile(filePath, project);
}

export function checkProjectFile() {
  let config: ReturnType<typeof readProjectFile>;
  try {
    config = readProjectFile(PROJECT_FILE_NAME);
  } catch (ex) {
    if (ex.code !== 'ENOENT') {
      throw ex;
    }
    throw new FatalError(
      `${PROJECT_FILE_NAME} not found. Did you run "alwaysai app init"?`,
    );
  }
  return config;
}

export async function installModelsInProjectFile(filePath: string) {
  const config = readProjectFile(filePath);
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
