import { TerseError } from '@alwaysai/always-cli';

export type ModelId = {
  publisher: string;
  name: string;
};

export const ModelId = {
  parse(modelId: string) {
    const splits = modelId.split('/');
    const errorMessage = `Expected model ID to be of the form "@publisher/modelName"`;
    if (splits.length !== 2) {
      throw new TerseError(errorMessage);
    }
    if (splits[0].charAt(0) !== '@') {
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
