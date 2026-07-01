import prisma from '../../infrastructure/database/prisma.client';
import { CreateCategoryInput, UpdateCategoryInput } from '@nama/shared';

export class CategoryRepository {
  async findMany(isActive?: boolean) {
    return prisma.category.findMany({
      where: isActive !== undefined ? { isActive } : {},
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id }
    });
  }

  async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug }
    });
  }

  async create(input: CreateCategoryInput) {
    return prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        iconUrl: input.iconUrl,
        sortOrder: input.sortOrder || 0
      }
    });
  }

  async update(id: string, input: UpdateCategoryInput) {
    return prisma.category.update({
      where: { id },
      data: {
        name: input.name !== undefined ? input.name : undefined,
        slug: input.slug !== undefined ? input.slug : undefined,
        description: input.description !== undefined ? input.description : undefined,
        iconUrl: input.iconUrl !== undefined ? input.iconUrl : undefined,
        sortOrder: input.sortOrder !== undefined ? input.sortOrder : undefined,
        isActive: input.isActive !== undefined ? input.isActive : undefined
      }
    });
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: { id }
    });
  }
}

export const categoryRepository = new CategoryRepository();
export default categoryRepository;
