import { categoryRepository } from './category.repository';
import { CreateCategoryInput, UpdateCategoryInput } from '@nama/shared';
import { BadRequestError, NotFoundError } from '../../utils/errors';

export class CategoryService {
  async getCategories(isActive?: boolean) {
    return categoryRepository.findMany(isActive);
  }

  async getCategoryById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  async createCategory(input: CreateCategoryInput) {
    const existing = await categoryRepository.findBySlug(input.slug);
    if (existing) {
      throw new BadRequestError(`Category with slug '${input.slug}' already exists`);
    }
    return categoryRepository.create(input);
  }

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (input.slug && input.slug !== category.slug) {
      const existing = await categoryRepository.findBySlug(input.slug);
      if (existing) {
        throw new BadRequestError(`Category with slug '${input.slug}' already exists`);
      }
    }

    return categoryRepository.update(id, input);
  }

  async deleteCategory(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    await categoryRepository.delete(id);
  }
}

export const categoryService = new CategoryService();
export default categoryService;
