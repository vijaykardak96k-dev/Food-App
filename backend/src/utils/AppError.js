// An error with an HTTP status code and a friendly message that is safe to show users.
export class AppError extends Error {
  constructor(message, status = 400, code = null) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
