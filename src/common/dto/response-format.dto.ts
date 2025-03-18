export class ResponseFormat {
  status: 'success' | 'error';
  message: string;
  data?: object;
  error?: object;

  constructor({ status, message, data, error }: Partial<ResponseFormat>) {
    this.status = status ?? 'success';
    this.message =
      message ?? (error ? 'Server error' : 'Request completed successfully');
    this.data = data;
    this.error = error;
  }
}
