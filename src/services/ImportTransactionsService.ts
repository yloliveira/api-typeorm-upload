import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getRepository, In, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  filename: string;
  mimetype: string;
}

interface CreateTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface LoadCSV {
  transactions: CreateTransaction[];
  categories: string[];
}

class ImportTransactionsService {
  private async loadCSV(req: Request): Promise<LoadCSV> {
    const { filename, mimetype } = req;
    const csvFilePath = path.resolve(uploadConfig.directory, filename);
    const readCSVStream = fs.createReadStream(csvFilePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CreateTransaction[] = [];
    let categories: string[] = [];

    parseCSV.on('data', ([title, type, value, category]) => {
      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    categories = categories.filter(
      (category, index) => categories.indexOf(category) === index,
    );

    return { transactions, categories };
  }

  private async createCategories(categories: string[]): Promise<Category[]> {
    const categoryRepository = getRepository(Category);
    const existentCategories = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });
    const existentCategoriesTitle = existentCategories.map(
      (category: Category) => category.title,
    );
    const inexistentCategories = categories.filter(
      (category: string) => !existentCategoriesTitle.includes(category),
    );

    const newCategories = categoryRepository.create(
      inexistentCategories.map((title: string) => ({
        title,
      })),
    );

    await categoryRepository.save(newCategories);
    return [...existentCategories, ...newCategories];
  }

  async execute(req: Request): Promise<Transaction[]> {
    const { transactions, categories } = await this.loadCSV(req);
    const newCategories = await this.createCategories(categories);
    const transactionRepository = getCustomRepository(TransactionRepository);

    const newTransactions = transactionRepository.create(
      transactions.map(transaction => {
        const { title, type, value, category } = transaction;
        const { id } = newCategories.find(cat => cat.title === category);
        return {
          title,
          type,
          value,
          category_id: id,
        };
      }),
    );
    await transactionRepository.save(newTransactions);
    return newTransactions;
  }
}

export default ImportTransactionsService;
