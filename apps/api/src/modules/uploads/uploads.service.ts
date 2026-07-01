import { PresignUploadInput } from '@nama/shared';
import { validateUploadMetadata } from '../../infrastructure/storage/mime-validator';
import { buildS3Key } from '../../infrastructure/storage/key.builder';
import { s3Service } from '../../infrastructure/storage/s3.service';

export class UploadsService {
  async getPresignedUpload(userId: string, input: PresignUploadInput) {
    // 1. Validate MIME type & file size constraints
    validateUploadMetadata(input.purpose, input.mimeType, input.fileSizeBytes);

    // 2. Generate unique S3 key path
    const key = buildS3Key(input.purpose, userId, input.fileName);

    // 3. Generate presigned URL & return result
    return s3Service.getPresignedUploadUrl(input.purpose, key, input.mimeType);
  }
}

export const uploadsService = new UploadsService();
export default uploadsService;
