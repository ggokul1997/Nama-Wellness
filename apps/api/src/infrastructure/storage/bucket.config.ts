export function getBucketForPurpose(purpose: string): string {
  if (purpose === 'recording') {
    return process.env.S3_BUCKET_RECORDINGS || 'nama-wellness-recordings';
  }
  return process.env.S3_BUCKET_MEDIA || 'nama-wellness-media';
}
