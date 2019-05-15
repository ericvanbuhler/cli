import { TerseError } from '@alwaysai/alwayscli';

export type ModelId = {
  publisher: string;
  name: string;
};

export const ModelId = {
  parse(id: string) {
    const errorMessage = `Expected model ID to be of the form "publisher/name"`;
    const splits = id.split('/');
    if (splits.length !== 2) {
      throw new TerseError(errorMessage);
    }
    for (const split of splits) {
      if (!split) {
        throw new TerseError(errorMessage);
      }
      // TODO: Check for valid chars
    }
    return {
      publisher: splits[0],
      name: splits[1],
    };
  },
  serialize({ publisher, name }: ModelId) {
    return `${publisher}/${name}`;
  },
};
