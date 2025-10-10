import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { Staff, StaffDocument } from './schemas/staff.schema';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateSTaffDto } from './dto/update-staff.dto';
import { staffStatus } from './enum/staff.enum';
import { AlphaNumeric } from 'src/core/common/utils/authentication';
import { paginate } from 'src/utils/utils';
import { MailService } from 'src/core/mail/email';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailService,
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

      do {
        staffId = AlphaNumeric(4);
        profileLink = `https://tapsync.com/${AlphaNumeric(3)}/company-${companyId}`;
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

      const modelQuery = this.staffModel.find(filter).sort({ createdAt: -1 });
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
