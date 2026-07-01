import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { isActive } = req.query;
    const isActiveFilter = isActive !== undefined ? isActive === 'true' : undefined;
    const result = await categoryService.getCategories(isActiveFilter);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await categoryService.createCategory(req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categoryId = req.params.categoryId as string;
    const result = await categoryService.updateCategory(categoryId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categoryId = req.params.categoryId as string;
    await categoryService.deleteCategory(categoryId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
