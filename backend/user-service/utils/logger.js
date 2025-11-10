/**
 * Structured logging utility for user-service
 * Provides consistent logging with error types, codes, and metadata
 */

/**
 * Log levels
 */
export const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

/**
 * Error types for structured logging
 */
export const ErrorType = {
  DUPLICATE_USERNAME: 'duplicate_username',
  DUPLICATE_EMAIL: 'duplicate_email',
  VALIDATION_ERROR: 'validation_error',
  AUTHENTICATION_ERROR: 'authentication_error',
  AUTHORIZATION_ERROR: 'authorization_error',
  NOT_FOUND: 'not_found',
  DATABASE_ERROR: 'database_error',
  INTERNAL_ERROR: 'internal_error',
  EXTERNAL_SERVICE_ERROR: 'external_service_error'
};

/**
 * Structured logger that outputs JSON for better log parsing
 */
export class StructuredLogger {
  constructor(fastifyLogger = null) {
    this.fastifyLogger = fastifyLogger;
  }

  /**
   * Log an error with structured fields
   */
  error(correlationId, message, options = {}) {
    const logData = {
      correlationId,
      // Don't set 'level' - Pino already sets it as a number (50 for error)
      msg: message, // Pino uses 'msg' for the message field
      errorType: options.errorType || ErrorType.INTERNAL_ERROR,
      errorCode: options.errorCode,
      httpStatus: options.httpStatus,
      ...options.metadata
    };

    if (this.fastifyLogger) {
      // Pino expects fields at the top level
      this.fastifyLogger.error(logData);
    } else {
      // Fallback to console with JSON format for Logstash parsing
      console.error(JSON.stringify(logData));
    }
  }

  /**
   * Log a warning with structured fields
   */
  warn(correlationId, message, options = {}) {
    const logData = {
      correlationId,
      level: LogLevel.WARN,
      message,
      ...options.metadata
    };

    if (this.fastifyLogger) {
      this.fastifyLogger.warn(logData);
    } else {
      console.warn(JSON.stringify(logData));
    }
  }

  /**
   * Log info with structured fields
   */
  info(correlationId, message, options = {}) {
    const logData = {
      correlationId,
      level: LogLevel.INFO,
      message,
      ...options.metadata
    };

    if (this.fastifyLogger) {
      this.fastifyLogger.info(logData);
    } else {
      console.log(JSON.stringify(logData));
    }
  }

  /**
   * Log debug with structured fields
   */
  debug(correlationId, message, options = {}) {
    const logData = {
      correlationId,
      level: LogLevel.DEBUG,
      message,
      ...options.metadata
    };

    if (this.fastifyLogger) {
      this.fastifyLogger.debug(logData);
    } else {
      console.log(JSON.stringify(logData));
    }
  }
}

/**
 * Create a logger instance
 */
export function createLogger(fastifyLogger = null) {
  return new StructuredLogger(fastifyLogger);
}

