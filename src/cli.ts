#!/usr/bin/env node

import { createCommandLineInterface } from '@alwaysai/always-cli';
import { root } from './root';

const commandLineInterface = createCommandLineInterface(root);
commandLineInterface();
