import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { PaginationDto } from 'src/core/common/pagination/pagination';
import {
  Notification,
  NotificationDocument,
} from '../schemas/notification.schema';
import { CreeateNotificationDto } from '../dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(payload: CreeateNotificationDto & { user: string }) {
    try {
      const notification = await this.notificationModel.create({
        user: payload.user,
        ...payload,
      });
      return notification;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async findAll(
    query: PaginationDto & { notificationType: string },
    userId?: string,
  ) {
    try {
      const { search, page = 1, limit = 1000 } = query;
      const skip = (page - 1) * limit;

      const filter: any = {};

      if (userId) {
        filter.user = userId;
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ];
      }

      const notifications = await this.notificationModel
        .find(filter)
        .skip(skip)
        .limit(limit);

      const total = await this.notificationModel.countDocuments(filter);

      return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: notifications,
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
      const notification = await this.notificationModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
      });

      if (!notification) throw new NotFoundException('notification not found');
      return notification;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async markAsRead(id: string, userId: string) {
    try {
      const notification = await this.notificationModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), user: userId },
        { isRead: true },
        { new: true },
      );

      if (!notification) {
        throw new NotFoundException(
          'Notification not found or not owned by user',
        );
      }

      return notification;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }
}
