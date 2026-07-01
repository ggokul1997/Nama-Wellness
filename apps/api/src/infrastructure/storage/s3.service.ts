import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './s3.client';
import { getBucketForPurpose } from './bucket.config';

export class S3Service {
  async getPresignedUploadUrl(purpose: string, key: string, mimeType: string, expiresInSeconds = 300) {
    const bucket = getBucketForPurpose(purpose);
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: mimeType
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expiresInSeconds
    });

    const fileUrl = `s3://${bucket}/${key}`;

    return {
      uploadUrl,
      fileUrl,
      expiresIn: expiresInSeconds
    };
  }
}

export const s3Service = new S3Service();
export default s3Service;
