export const LogLevel = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  stack?: string;
  context?: any;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  public log(level: LogLevel, message: string, context?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (context instanceof Error) {
      entry.stack = context.stack;
      entry.message = message || context.message;
    }

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // In a real app, send to Sentry/Datadog here
    console[level](`[${entry.timestamp}] [${level.toUpperCase()}]: ${message}`, context || '');
  }

  public info(message: string, context?: any) {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: any) {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, error?: any) {
    this.log(LogLevel.ERROR, message, error);
  }

  public getLogs() {
    return this.logs;
  }
}

export const logger = new LoggerService();