import { PartialType } from '@nestjs/swagger';
import { CreateStaffDto } from './create-staff.dto';

export class UpdateSTaffDto extends PartialType(CreateStaffDto) {}
