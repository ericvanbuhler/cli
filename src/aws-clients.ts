import * as Aws from 'aws-sdk';

export function S3(opts: { region: string }) {
  return new Aws.S3({
    region: opts.region,
    accessKeyId: 'AKIA6PDW4RG4KZOCN2V7',
    secretAccessKey: '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',
  });
}
