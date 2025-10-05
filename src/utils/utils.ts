export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Handles pagination for any Mongoose model query.
 */
export async function paginate<T>(
  modelQuery: any,
  page: number = 1,
  limit: number = 50,
): Promise<PaginationResult<T>> {
  const validPage = Number(page) > 0 ? Number(page) : 1;
  const validLimit = Number(limit) > 0 ? Number(limit) : 50;
  const skip = (validPage - 1) * validLimit;

  const [data, total] = await Promise.all([
    modelQuery.skip(skip).limit(validLimit),
    modelQuery.model.countDocuments(modelQuery.getQuery()),
  ]);

  return {
    data,
    total,
    page: validPage,
    limit: validLimit,
    totalPages: Math.ceil(total / validLimit),
  };
}
