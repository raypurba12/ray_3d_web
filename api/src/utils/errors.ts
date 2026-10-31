export class ApiError extends Error {
  readonly status: number;
  readonly errors?: unknown[];

  constructor(status: number, message: string, errors?: unknown[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}
