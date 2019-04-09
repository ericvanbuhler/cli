import { TerseError } from '@alwaysai/always-cli';

export type ModelId = {
  publisher: string;
  name: string;
};

export const ModelId = {
  parse(modelId: string) {
    const errorMessage = `Expected model ID to be of the form "@publisher/modelName"`;
    if (modelId.charAt(0) !== '@') {
      throw new TerseError(errorMessage);
    }
    const splits = modelId.split('/');
    if (splits.length !== 2) {
      throw new TerseError(errorMessage);
    }
    return {
      publisher: splits[0].slice(1),
      name: splits[1],
    };
  },
  serialize({ publisher, name }: ModelId) {
    return `@${publisher}/${name}`;
  },
};
