type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMetadata {
  [key: string]: any;
}

export class Logger {
  static log(level: LogLevel, context: string, message: string, metadata?: LogMetadata) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context,
      message,
      ...metadata
    };

    // Log to console for development
    console[level](JSON.stringify(logEntry));

    // TODO: Add production logging service integration
    // e.g., CloudWatch, DataDog, etc.
  }

  static error(context: string, error: Error, metadata?: LogMetadata) {
    this.log('error', context, error.message, {
      ...metadata,
      stack: error.stack
    });
  }

  static info(context: string, message: string, metadata?: LogMetadata) {
    this.log('info', context, message, metadata);
  }

  static warn(context: string, message: string, metadata?: LogMetadata) {
    this.log('warn', context, message, metadata);
  }

  static debug(context: string, message: string, metadata?: LogMetadata) {
    this.log('debug', context, message, metadata);
  }
}
