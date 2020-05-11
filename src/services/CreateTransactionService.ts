import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

export default class CreateTransactionService {
  private validateRequestFields(request: Request): void {
    const { title, value, type, category } = request;
    const types = ['income', 'outcome'];
    if (!title || !value || !types.includes(type) || !category) {
      throw new AppError('Invalid entries');
    }
  }

  public async execute(request: Request): Promise<Transaction> {
    this.validateRequestFields(request);
    const { title, type, value, category } = request;
    const transactionRepository = getCustomRepository(TransactionRepository);

    const { total } = await transactionRepository.getBalance();
    if (request.type === 'outcome' && request.value > total) {
      throw new AppError('No valid balance for this transaction.');
    }

    const createCategory = new CreateCategoryService();
    const { id: category_id } = await createCategory.execute({
      title: category,
    });

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id,
    });
    await transactionRepository.save(transaction);
    return transaction;
  }
}
