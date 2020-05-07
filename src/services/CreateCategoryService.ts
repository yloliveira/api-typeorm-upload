import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

interface Request {
  title: string;
}

export default class CreateCategoryService {
  private validateRequest({ title }: Request): void {
    if (!title) {
      throw new AppError('Invalid entries');
    }
  }

  public async execute({ title }: Request): Promise<Category> {
    this.validateRequest({ title });
    const categoryRepository = getRepository(Category);
    const category = categoryRepository.create({ title });
    await categoryRepository.save(category);
    return category;
  }
}
