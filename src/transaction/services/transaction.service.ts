import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '../schemas/transaction.schema';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
  ) {}

  async createTransaction(data: Partial<CreateTransactionDto>) {
    const transaction = new this.transactionModel(data);
    return transaction.save();
  }

  async updateTransactionStatus(reference: string, status: string) {
    return this.transactionModel.findOneAndUpdate(
      { reference },
      { status },
      { new: true },
    );
  }

  async findByReference(reference: string) {
    return this.transactionModel.findOne({ reference });
  }
}
