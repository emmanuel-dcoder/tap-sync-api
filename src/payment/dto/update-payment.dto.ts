import { PartialType } from '@nestjs/swagger';
import { CreatePaymentDto } from './create-payment.dto';

export class UpdateCreatePaymentDto extends PartialType(CreatePaymentDto) {}
