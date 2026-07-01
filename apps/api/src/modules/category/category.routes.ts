import { Router } from 'express';
import { handleGetCategories, handleCreateCategory, handleUpdateCategory, handleDeleteCategory } from './category.controller';
import { createCategorySchema, updateCategorySchema } from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// Public route
router.get('/', handleGetCategories);

// Admin routes
router.post('/', authenticate, requireRole(['admin']), validate(createCategorySchema), handleCreateCategory);
router.patch('/:categoryId', authenticate, requireRole(['admin']), validate(updateCategorySchema), handleUpdateCategory);
router.delete('/:categoryId', authenticate, requireRole(['admin']), handleDeleteCategory);

export default router;
