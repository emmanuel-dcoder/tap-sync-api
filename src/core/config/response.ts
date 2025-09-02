import { HttpStatus } from '@nestjs/common';

export const successResponse = <T>({
  message,
  code = HttpStatus.OK,
  data,
  count,
  status = 'success',
}: {
  status?: string;
  message: string;
  code?: number;
  count?: any;
  data?: T;
}) => {
  return { status, message, data, count };
};
