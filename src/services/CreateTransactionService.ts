import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_id: string;
}

export default class CreateTransactionService {
  private validateRequestFields(request: Request): void {
    const { title, value, type, category_id } = request;
    const types = ['income', 'outcome'];
    if (!title || !value || !types.includes(type) || !category_id) {
      throw new AppError('Invalid entries');
    }
  }

  public async execute(request: Request): Promise<Transaction> {
    this.validateRequestFields(request);
    const transactionRepository = getCustomRepository(TransactionRepository);
    const transaction = transactionRepository.create(request);
    await transactionRepository.save(transaction);
    return transaction;
  }
}
