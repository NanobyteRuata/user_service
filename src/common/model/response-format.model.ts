import { IPaginationMeta } from 'nestjs-typeorm-paginate';

export class ResponseFormat {
  status: 'success' | 'error';
  message: string;
  data?: object;
  error?: object;
  pagination?: IPaginationMeta;

  constructor({
    status,
    message,
    data,
    error,
    pagination,
  }: Partial<ResponseFormat>) {
    this.status = status ?? 'success';
    this.message =
      message ?? (error ? 'Server error' : 'Request completed successfully');
    this.data = data;
    this.error = error;
    this.pagination = pagination;
  }
}
