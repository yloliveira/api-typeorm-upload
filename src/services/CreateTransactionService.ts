import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  private validateRequest(request: Request): boolean {
    const { title, value, type, category } = request;
    const types = ['income', 'outcome'];
    return !!title && !!value && types.includes(type) && !!category;
  }

  public async execute(request: Request): Promise<void> {
    const requestFieldsAreValid = this.validateRequest(request);
    if (!requestFieldsAreValid) {
      throw new AppError('Invalid entries');
    }
  }
}

export default CreateTransactionService;
