import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateNotificationDto extends PartialType(CreateTicketDto) {}
