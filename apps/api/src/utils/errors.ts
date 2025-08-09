export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;
  constructor(code: string, message: string, status = 400, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const Errors = {
  Unauthorized: () => new AppError('UNAUTHORIZED', 'Unauthorized', 401),
  Forbidden: () => new AppError('FORBIDDEN', 'Forbidden', 403),
  NotFound: (entity = 'Resource') => new AppError('NOT_FOUND', `${entity} not found`, 404),
  RateLimited: () => new AppError('RATE_LIMITED', 'Too many requests', 429),
  PaymentRequired: (msg: string) => new AppError('PAYMENT_REQUIRED', msg, 402),
};

