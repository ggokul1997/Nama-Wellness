import { randomUUID } from 'crypto';
import { BadRequestError } from '../../utils/errors';

export function buildS3Key(purpose: string, userId: string, fileName: string): string {
  const uniqueId = randomUUID();
  const sanitizedName = fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');

  switch (purpose) {
    case 'avatar':
      return `avatars/${userId}/${uniqueId}-${sanitizedName}`;
    case 'document':
      return `documents/teachers/${userId}/${uniqueId}-${sanitizedName}`;
    case 'material':
      return `materials/courses/${uniqueId}-${sanitizedName}`;
    case 'assignment':
      return `assignments/courses/${uniqueId}-${sanitizedName}`;
    case 'recording':
      return `recordings/sessions/${uniqueId}-${sanitizedName}`;
    case 'chat':
      return `chat/${uniqueId}-${sanitizedName}`;
    default:
      throw new BadRequestError(`Unsupported key building purpose: ${purpose}`);
  }
}
