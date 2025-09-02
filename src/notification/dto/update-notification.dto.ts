import { PartialType } from '@nestjs/swagger';
import { CreeateNotificationDto } from './create-notification.dto';

export class UpdateNotificationDto extends PartialType(
  CreeateNotificationDto,
) {}
