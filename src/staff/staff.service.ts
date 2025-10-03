import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { Staff, StaffDocument } from './schemas/staff.schema';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateSTaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
    private readonly cloudinaryService: CloudinaryService,
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

      const staff = await this.staffModel.create({
        ...createStaffDto,
        image: picture,
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
