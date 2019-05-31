import {
  createBranch,
  createLeaf,
  createOneOfInput,
  createFlagInput,
} from '@alwaysai/alwayscli';
import { configFile } from '../../config';
import { CLI_NAME } from '../../constants';
import { SYSTEM_IDS } from '@alwaysai/codecs';

const show = createLeaf({
  name: 'show',
  description: `Show your current "${CLI_NAME}" configuration`,
  action() {
    return configFile.read();
  },
});

const set = createLeaf({
  name: 'set',
  description: `Set an "${CLI_NAME}" configuration value`,
  options: {
    systemId: createOneOfInput({ values: SYSTEM_IDS, required: true }),
  },
  action(_, opts) {
    if (opts.systemId) {
      configFile.update(config => {
        config.systemId = opts.systemId;
      });
    }
  },
});

const unset = createLeaf({
  name: 'unset',
  description: `Unset an "${CLI_NAME}" configuration value`,
  options: {
    all: createFlagInput(),
    systemId: createFlagInput(),
  },
  action(_, opts) {
    if (opts.all) {
      configFile.remove();
      return;
    }
    if (opts.systemId) {
      configFile.update(config => {
        delete config.systemId;
      });
    }
  },
});

export const config = createBranch({
  name: 'config',
  hidden: true,
  description: `Show or set "${CLI_NAME}" configuration values`,
  subcommands: [show, set, unset],
});
