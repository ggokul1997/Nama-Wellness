import { Router } from 'express';
import { handleGetPresignedUpload } from './uploads.controller';
import { presignUploadSchema } from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/presign', authenticate, validate(presignUploadSchema), handleGetPresignedUpload);

export default router;
