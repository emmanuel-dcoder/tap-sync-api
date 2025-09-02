import { IsOptional, IsString, IsInt, Min, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class JobPaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  jobType?: 'full-time' | 'part-time' | 'contract' | 'all-types';

  @IsOptional()
  @IsString()
  priceModel?: 'hourly' | 'daily' | 'monthly' | 'fixed';

  @IsOptional()
  @IsString()
  status?: 'pending' | 'review' | 'approved' | 'closed' | 'open';

  @IsOptional()
  @IsString()
  budgetRange?: '10-50' | '51-100' | '101-500' | '501-1000' | 'above1000';

  @IsOptional()
  @IsString()
  accountType: 'client' | 'freelancer';

  @IsOptional()
  @IsString()
  @IsMongoId()
  userId: string;
}
