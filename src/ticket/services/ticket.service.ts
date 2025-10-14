import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { PaginationDto } from 'src/core/common/pagination/pagination';
import { Ticket, TicketDocument } from '../schemas/ticket.schema';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { AlphaNumeric } from 'src/core/common/utils/authentication';
import { status } from '../enum/ticket.enum';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name)
    private ticketModel: Model<TicketDocument>,
  ) {}

  async create(payload: CreateTicketDto) {
    try {
      const { user } = payload;

      let ticketId;
      let validateId;

      do {
        ticketId = `TICKET-${AlphaNumeric(4)}`;
        validateId = await this.ticketModel.findOne({ ticketId });
      } while (validateId);

      const ticket = await this.ticketModel.create({
        user: new mongoose.Types.ObjectId(user),
        userType: 'User',
        ...payload,
      });

      if (!ticket)
        throw new BadRequestException(
          'Error creating ticket, please try again',
        );
      return ticket;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async findAll(query: PaginationDto & { user?: string }) {
    try {
      const { search, page = 1, limit = 50, user } = query;
      const skip = (page - 1) * limit;

      const filter: any = {};

      if (user) {
        filter.user = user;
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { status: { $regex: search, $options: 'i' } },
        ];
      }
      console.log('filter', filter);
      console.log('query', query);
      const ticket = await this.ticketModel
        .find(filter)
        .populate({
          path: 'user',
          select:
            'name businessName businessEmail businessUsername businessPhoneNumber email username profileImage',
        })
        .skip(skip)
        .limit(limit);

      const total = await this.ticketModel.countDocuments();

      return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: ticket,
      };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async findOne(id: string) {
    try {
      const ticket = await this.ticketModel
        .findOne({
          _id: new mongoose.Types.ObjectId(id),
        })
        .populate({
          path: 'user',
          select:
            'name businessName businessEmail businessUsername businessPhoneNumber email username profileImage',
        });

      if (!ticket) throw new NotFoundException('ticket not found');
      return ticket;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async updateStatus(id: string, newStatus: status) {
    try {
      if (!Object.values(status).includes(newStatus)) {
        throw new BadRequestException('Invalid status value');
      }

      const ticket = await this.ticketModel.findById(id);
      if (!ticket) throw new NotFoundException('Ticket not found');

      ticket.status = newStatus;
      await ticket.save();

      return ticket;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }
}
