import { PartialType } from '@nestjs/swagger';
import { RequestDto } from './create-request.dto';

export class UpdateRequestDto extends PartialType(RequestDto) {}
