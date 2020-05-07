import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const income = transactions.reduce(
      (acc, cur) => (cur.type === 'income' ? acc + Number(cur.value) : acc),
      0,
    );
    const outcome = transactions.reduce(
      (acc, cur) => (cur.type === 'outcome' ? acc + Number(cur.value) : acc),
      0,
    );

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };
    return balance;
  }
}

export default TransactionsRepository;
