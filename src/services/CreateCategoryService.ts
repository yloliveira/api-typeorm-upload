import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

interface Request {
  title: string;
}

export default class CreateCategoryService {
  private validateRequestFields({ title }: Request): void {
    if (!title) {
      throw new AppError('Invalid entries');
    }
  }

  public async execute({ title }: Request): Promise<Category> {
    this.validateRequestFields({ title });
    const categoryRepository = getRepository(Category);
    let category = await categoryRepository.findOne({ where: { title } });

    if (!category) {
      category = categoryRepository.create({ title });
      await categoryRepository.save(category);
    }
    return category;
  }
}
