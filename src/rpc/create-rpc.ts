import { CodedError } from '@carnesen/coded-error';
import * as http from 'http';
import * as https from 'https';

type RpcConfig = {
  protocol: 'http' | 'https';
  hostname: string;
  username: string;
  password: string;
  port: number;
};

export function createRpc(config: RpcConfig) {
  const { protocol, hostname, port, username, password } = config;
  const auth = `${username}:${password}`;

  return async function rpc(methodName: string, args: unknown[] = []) {
    const requestData = JSON.stringify({
      methodName,
      args,
    });

    const result: any = await new Promise((resolve, reject) => {
      const req = (protocol === 'http' ? http : https).request({
        hostname,
        port,
        method: 'POST',
        path: '/rpc',
        auth,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': requestData.length,
        },
      });

      req.once('response', (res: http.IncomingMessage) => {
        let responseData = '';

        if (typeof res.statusCode === 'undefined') {
          throw new Error('Expected response to have statusCode');
        }

        res.on('data', chunk => {
          responseData += chunk;
        });

        res.on('end', () => {
          let parsed: any;
          try {
            parsed = JSON.parse(responseData);
          } catch (ex) {
            const err = new Error(`Failed to parse response "${responseData}"`);
            reject(err);
            throw err;
          }
          if (res.statusCode === 200) {
            resolve(parsed.result);
          } else {
            reject(
              new CodedError(
                parsed.message || 'An error has occurred',
                parsed.code,
                parsed.data,
              ),
            );
          }
        });
      });

      req.on('error', (err: NodeJS.ErrnoException) => {
        reject(new CodedError(`http request failed "${err.message}"`, err.code));
      });

      req.end(requestData);
    });

    return result;
  };
}
