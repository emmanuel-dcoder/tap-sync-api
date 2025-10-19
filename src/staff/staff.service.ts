import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { Staff, StaffDocument } from './schemas/staff.schema';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateSTaffDto } from './dto/update-staff.dto';
import { employmentType, staffStatus } from './enum/staff.enum';
import { AlphaNumeric } from 'src/core/common/utils/authentication';
import { paginate } from 'src/utils/utils';
import { MailService } from 'src/core/mail/email';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';
import { NotificationService } from 'src/notification/services/notification.service';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { RequestDocument } from 'src/request/schemas/request.schema';
import { RequestDto } from 'src/request/dto/create-request.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
  ) {}

  private toObjectId(id: string) {
    return new mongoose.Types.ObjectId(id);
  }

  async addStaff(
    companyId: string,
    createStaffDto: CreateStaffDto,
    files?: { picture?: Express.Multer.File[] },
  ) {
    try {
      let picture: string | undefined;

      if (files?.picture?.[0]) {
        picture = await this.uploadUserImage(files.picture[0]);
      }

      let staffId;
      let validateId;
      let profileLink;
      const user = await this.userModel.findOne({
        _id: new mongoose.Types.ObjectId(companyId),
      });

      do {
        staffId = AlphaNumeric(4, 'number');
        profileLink = `https://tapsync.com/${user.name}/staff-${staffId}`;
        validateId = await this.staffModel.findOne({ staffId, profileLink });
      } while (validateId);

      const staff = await this.staffModel.create({
        ...createStaffDto,
        image: picture,
        profileLink,
        companyId: this.toObjectId(companyId),
      });

      if (!staff) {
        throw new BadRequestException('Unable to create staff');
      }
      try {
        await this.notificationService.create({
          title: 'Tapsync: Staff Added 🤝',
          body: 'Staff Added successfully 👍👍',
          userType: 'User',
          user: `${companyId}`,
        });
      } catch (error) {
        console.log('notification Error');
      }
      return staff;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error.message,
        error?.status ?? 500,
      );
    }
  }

  async updateStaff(
    staffId: string,
    updateStaffDto: UpdateSTaffDto,
    files?: { picture?: Express.Multer.File[] },
  ) {
    try {
      let picture: string | undefined;

      if (files?.picture?.[0]) {
        picture = await this.uploadUserImage(files.picture[0]);
      }

      const updateData = {
        ...updateStaffDto,
        ...(picture && { image: picture }),
      };

      const staff = await this.staffModel.findOneAndUpdate(
        { _id: this.toObjectId(staffId) },
        updateData,
        { new: true, runValidators: true },
      );

      if (!staff) throw new BadRequestException('Invalid staff ID');

      try {
        await this.notificationService.create({
          title: 'Tapsync: Staff Updated 🤝',
          body: 'Staff update successfully 👍👍',
          userType: 'User',
          user: `${staff.companyId}`,
        });
      } catch (error) {
        console.log('notification Error');
      }

      return staff;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error.message,
        error?.status ?? 500,
      );
    }
  }

  async getStaff(query: {
    companyId: string;
    staffId?: string;
    search?: string;
    department?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const filter: any = {
        companyId: new mongoose.Types.ObjectId(query.companyId),
      };

      if (query.staffId) {
        filter._id = new mongoose.Types.ObjectId(query.staffId);
      }

      if (query.search) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [{ name: regex }, { email: regex }, { position: regex }];
      }

      if (query.department) {
        filter.department = query.department;
      }

      const modelQuery = this.staffModel
        .find(filter)
        .populate({
          path: 'companyId',
          select:
            'name logo businessUsername bio email profileImage bannerImage textColor link backgroundColor username phone title businessName',
        })
        .sort({ createdAt: -1 });
      const pagination = await paginate(modelQuery, query.page, query.limit);

      return {
        staff: pagination.data,
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error.message,
        error?.status ?? 500,
      );
    }
  }

  async updateStaffStatus(staffId: string, status: staffStatus) {
    try {
      const staff = await this.staffModel.findOneAndUpdate(
        { _id: this.toObjectId(staffId) },
        { status },
        { new: true, runValidators: true },
      );

      if (!staff) {
        throw new BadRequestException('Invalid staff ID');
      }

      try {
        await this.notificationService.create({
          title: 'Tapsync: Staff Status 🤝',
          body: 'Staff Status updated 👍👍',
          userType: 'User',
          user: `${staff.companyId}`,
        });
      } catch (error) {
        console.log('notification Error');
      }

      return staff;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error.message,
        error?.status ?? 500,
      );
    }
  }

  async addPoints(staffId: string, points: number) {
    try {
      if (points <= 0) {
        throw new BadRequestException('Points must be greater than zero');
      }

      const staff = await this.staffModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(staffId) },
        { $inc: { points } },
        { new: true },
      );

      if (!staff) {
        throw new BadRequestException('Invalid staff ID');
      }

      try {
        await this.notificationService.create({
          title: 'Tapsync: Points 🤝',
          body: 'Staff Points updated 👍👍',
          userType: 'User',
          user: `${staff.companyId}`,
        });
      } catch (error) {
        console.log('notification Error');
      }

      return staff;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error.message,
        error?.status ?? 500,
      );
    }
  }

  /// send message notifcation to staff
  async notifyStaff(staffIds: string[], message: string) {
    try {
      if (!Array.isArray(staffIds) || staffIds.length === 0) {
        throw new BadRequestException('Staff id array cannot be empty');
      }

      if (!message || message.trim().length === 0) {
        throw new BadRequestException('Message is required');
      }

      // validate ids and convert all to mongoosse id
      const validIds = staffIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (validIds.length === 0) {
        throw new BadRequestException('No valid staff id found');
      }

      const staffList = await this.staffModel.find({
        _id: { $in: validIds },
      });

      if (staffList.length === 0) {
        throw new BadRequestException('No staff found for provided IDs');
      }

      //promise
      await Promise.all(
        staffList.map(async (staff) => {
          await this.mailService.sendMailNotification(
            staff.email,
            `${staff.department}: Notification`,
            { message, name: staff.name },
            'message',
          );
          console.log(`Sending email to ${staff.email}`);
        }),
      );

      return {
        count: staffList.length,
        recipients: staffList.map((s) => s.email),
      };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error.message,
        error?.status ?? 500,
      );
    }
  }

  /**card request */
  async cardRequest(userId: string, requestDto: RequestDto, files?: any) {
    try {
      let logo: string | undefined;

      if (files?.logo?.[0]) {
        logo = await this.uploadUserImage(files.logo[0]);
      }

      const request = await this.requestModel.create({
        ...requestDto,
        logo,
        userId: new mongoose.Types.ObjectId(userId),
        isStaff: true,
      });

      if (!request)
        throw new BadRequestException('Unable to create card request...');

      try {
        await this.notificationService.create({
          title: 'Tapsync: Staff Card Request 🤝',
          body: 'Your card request for staff is successful 👍👍',
          userType: 'User',
          user: `${userId}`,
        });
      } catch (error) {
        console.log('notification Error');
      }
      return request;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  /***add csv file */
  async addMultipleStaffFromCSV(companyId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('CSV file is required');

    const results: any[] = [];
    const errors: any[] = [];
    const promises: Promise<any>[] = [];
    return new Promise((resolve, reject) => {
      const stream = Readable.from(file.buffer.toString());

      stream
        .pipe(
          csvParser({
            mapHeaders: ({ header }) => header.trim().toLowerCase(),
          }),
        )
        .on('data', (row) => {
          // push each async operation into promises[]
          const task = (async () => {
            try {
              const name = row.name?.trim();
              const email = row.email?.trim()?.toLowerCase();
              const position = row.position?.trim();

              if (!name || !email || !position) {
                errors.push({ row, error: 'Missing required fields' });
                return;
              }

              let staffId: string;
              let profileLink: string;
              let exists;

              do {
                staffId = AlphaNumeric(4);
                profileLink = `https://tapsync.com/staff-${staffId}/company-${companyId}`;
                exists = await this.staffModel.findOne({ staffId });
              } while (exists);

              const staff = new this.staffModel({
                name,
                email,
                position,
                address: row.address?.trim() || '',
                contactNo: row.contactNo?.trim() || '',
                department: row.department?.trim() || '',
                employmentType:
                  row.employmentType?.trim() || employmentType.fullTime,
                staffId,
                profileLink,
                companyId: new mongoose.Types.ObjectId(companyId),
              });

              await staff.save();

              results.push(staff);
            } catch (error) {
              errors.push({ row, error: error.message });
            }
          })();

          try {
            this.notificationService.create({
              title: 'Tapsync: Bulk Upload 🤝',
              body: 'Your bulk upload is completed 👍👍',
              userType: 'User',
              user: `${companyId}`,
            });
          } catch (error) {
            console.log('notification Error');
          }

          promises.push(task);
        })
        .on('end', async () => {
          try {
            await Promise.all(promises); // wait for all DB operations
            resolve({
              inserted: results.length,
              failed: errors.length,
              errors,
            });
          } catch (err) {
            reject(
              new HttpException(`Error inserting staff: ${err.message}`, 500),
            );
          }
        })
        .on('error', (err) => {
          reject(
            new HttpException(`Failed to process CSV: ${err.message}`, 500),
          );
        });
    });
  }

  private async uploadUserImage(file: Express.Multer.File) {
    try {
      const uploadedFile = await this.cloudinaryService.uploadFile(
        file,
        'profile-image',
      );
      return uploadedFile.secure_url;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error.message,
        error?.status ?? 500,
      );
    }
  }
}
