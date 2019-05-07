import { AuthClass } from '@aws-amplify/auth';
import { runAndExit } from '@alwaysai/always-cli';
(global as any).fetch = require('node-fetch');
const auth = new AuthClass({
  userPoolId: 'us-east-2_hrTFkuD0s',
  userPoolWebClientId: '2apbsgodmqspoavjb8vivlcsbj',
});

runAndExit(async () => {
  const user = await auth.signIn('carnesen', 'alwaysai');
  if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
    await auth.completeNewPassword(user, 'alwaysai', []);
  }
});
