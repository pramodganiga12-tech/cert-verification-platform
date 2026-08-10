export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export class Logger {
  private static formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaString}`;
  }

  static info(message: string, meta?: unknown): void {
    console.log(this.formatMessage(LogLevel.INFO, message, meta));
  }

  static warn(message: string, meta?: unknown): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, meta));
  }

  static error(message: string, meta?: unknown): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, meta));
  }

  static debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }
}
