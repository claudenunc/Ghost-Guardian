export const ErrorCode = Object.freeze({
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  PLATFORM: 'PLATFORM_API_ERROR',
  GUARDIAN: 'GUARDIAN_PROCESSING_ERROR',
  UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  UNEXPECTED: 'UNEXPECTED_APPLICATION_ERROR',
});

export class ApplicationError extends Error {
  constructor(code, message, options = {}) {
    super(message, options);
    this.name = 'ApplicationError';
    this.code = code;
    this.cause = options.cause;
  }
}

