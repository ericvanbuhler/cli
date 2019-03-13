import ora from 'ora';

export async function fakeSpinner(message: string, ms = 3000) {
  const spinner = ora(message).start();
  await new Promise(resolve => {
    setTimeout(() => {
      spinner.stop();
      resolve();
    }, ms);
  });
}
