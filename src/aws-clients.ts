import * as Aws from 'aws-sdk';

export function S3(opts: { region: string }) {
  return new Aws.S3({
    region: opts.region,
    ...JSON.parse(
      Buffer.from(
        'eyJhY2Nlc3NLZXlJZCI6IkFLSUE2UERXNFJHNE9KTkNLUEdCIiwic2VjcmV0QWNjZXNzS2V5IjoiSmt0QWttUVhKU1ppdGlucjZQZGw1VGIyOXIvWEltVHFSVXUzcDErZyJ9',
        'base64',
      ).toString('utf-8'),
    ),
  });
}
