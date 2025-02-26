type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
}

class Logger {
  private logToConsole(entry: LogEntry) {
    const logMessage = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    const data = entry.data ? `\n${JSON.stringify(entry.data, null, 2)}` : '';

    switch (entry.level) {
      case 'error':
        console.error(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      case 'info':
        console.info(logMessage, data);
        break;
      case 'debug':
        console.debug(logMessage, data);
        break;
    }
  }

  private createLogEntry(level: LogLevel, message: string, data?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  info(message: string, data?: Record<string, any>) {
    const entry = this.createLogEntry('info', message, data);
    this.logToConsole(entry);
  }

  warn(message: string, data?: Record<string, any>) {
    const entry = this.createLogEntry('warn', message, data);
    this.logToConsole(entry);
  }

  error(message: string, data?: Record<string, any>) {
    const entry = this.createLogEntry('error', message, data);
    this.logToConsole(entry);
  }

  debug(message: string, data?: Record<string, any>) {
    const entry = this.createLogEntry('debug', message, data);
    this.logToConsole(entry);
  }
}

export const logger = new Logger(); 