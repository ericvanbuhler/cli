#!/usr/bin/env node

import { createCommandLineInterface } from '@alwaysai/always-cli';
import { alwaysai } from '.';

const commandLineInterface = createCommandLineInterface(alwaysai);
commandLineInterface();
