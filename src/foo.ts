(global as any).fetch = require('node-fetch');
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk';
import { storage } from './credentials-store-2';

const userPool = new AmazonCognitoIdentity.CognitoUserPool({
  UserPoolId: 'us-east-2_hrTFkuD0s',
  ClientId: '2apbsgodmqspoavjb8vivlcsbj',
});

const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
  Username: 'carnesen',
  Pool: userPool,
  Storage: storage,
});

// const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
//   Username: 'carnesen',
//   Password: 'alwaysai',
// });

cognitoUser.forgotPassword({
  onFailure: console.log,
  onSuccess: console.log,
});

cognitoUser.authenticateUser(authenticationDetails, {
  onSuccess(result) {
    const accessToken = result.getAccessToken().getJwtToken();
    console.log('result');
    console.log(result);
    AWS.config.region = 'us-east-1';
    // refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()

    // AWS.config.credentials.refresh(error => {
    //   if (error) {
    //     console.error(error);
    //   } else {
    //     // Instantiate aws sdk service objects now that the credentials have been updated.
    //     // example: var s3 = new AWS.S3();
    //     console.log('Successfully logged!');
    //   }
    // });
  },
  newPasswordRequired(...args) {
    cognitoUser.completeNewPasswordChallenge('alwaysai', [], {
      onSuccess(...args) {
        console.log(args);
      },
      onFailure(ex) {
        console.log(ex);
      },
    });
    console.log(args);
  },
  onFailure(err) {
    console.log(err);
  },
});
