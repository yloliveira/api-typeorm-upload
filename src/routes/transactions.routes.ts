import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import CreateCategoryService from '../services/CreateCategoryService';
import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createCategory = new CreateCategoryService();
  const { id: category_id } = await createCategory.execute({ title: category });

  const createTransaction = new CreateTransactionService();
  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category_id,
  });
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute({ id: request.params.id });
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    return response.json({ ok: true });
  },
);

export default transactionsRouter;
