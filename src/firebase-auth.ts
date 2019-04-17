/// <reference lib="dom" />
// ^^ This is a workaround for
import * as firebase from 'firebase';

import { readSystemId } from './cli-config-file';

let apiKey: string;
let authDomain: string;
let projectId: string;
switch (readSystemId()) {
  case 'local':
  case 'development':
    apiKey = 'AIzaSyC1tsdHtAGsF3EvV9QwMnnZN0L7hUHFwrs';
    authDomain = 'alwaysai-dev.firebaseapp.com';
    projectId = 'alwaysai-dev';
    break;
  case 'production':
    // TODO: Get API key for alwaysai system
    apiKey = 'AIzaSyC1tsdHtAGsF3EvV9QwMnnZN0L7hUHFwrs';
    authDomain = 'alwaysai.firebaseapp.com';
    projectId = 'alwaysai';
    break;
  default:
    throw new Error('Unsupported systemId');
}

firebase.initializeApp({
  apiKey,
  authDomain,
  projectId,
});

export const firebaseAuth = firebase.auth();
