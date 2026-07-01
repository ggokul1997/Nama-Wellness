import { BadRequestError } from '../../utils/errors';

export interface ValidationRule {
  allowedMimes: string[];
  maxSizeBytes: number;
}

export const UPLOAD_RULES: Record<string, ValidationRule> = {
  avatar: {
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 5 * 1024 * 1024 // 5MB
  },
  document: {
    allowedMimes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 10 * 1024 * 1024 // 10MB
  },
  material: {
    allowedMimes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 20 * 1024 * 1024 // 20MB
  },
  assignment: {
    allowedMimes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 20 * 1024 * 1024 // 20MB
  },
  recording: {
    allowedMimes: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxSizeBytes: 500 * 1024 * 1024 // 500MB
  },
  chat: {
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'],
    maxSizeBytes: 15 * 1024 * 1024 // 15MB
  }
};

export function validateUploadMetadata(purpose: string, mimeType: string, fileSizeBytes: number) {
  const rule = UPLOAD_RULES[purpose];
  if (!rule) {
    throw new BadRequestError(`Invalid upload purpose: ${purpose}`);
  }

  if (!rule.allowedMimes.includes(mimeType)) {
    throw new BadRequestError(`MIME type '${mimeType}' is not allowed for purpose '${purpose}'`);
  }

  if (fileSizeBytes > rule.maxSizeBytes) {
    const maxSizeMB = rule.maxSizeBytes / (1024 * 1024);
    throw new BadRequestError(`File size exceeds the limit of ${maxSizeMB}MB for purpose '${purpose}'`);
  }
}
// For cleaner imports
export default validateUploadMetadata;
