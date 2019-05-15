import { URL } from 'url';

// E.g. https://alwaysai-models-dev.s3.us-west-2.amazonaws.com/3cee8cd5-582d-4374-a3a0-ca034730a672.tar.gz
export function parsePackageUrl(packageUrl: string) {
  const url = new URL(packageUrl);
  const [bucketName, , awsRegion] = url.hostname.split('.');
  return {
    bucketName,
    awsRegion,
    bucketKey: url.pathname.slice(1),
  };
}
