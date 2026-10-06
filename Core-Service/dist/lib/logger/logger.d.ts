type LogLevel = 'info' | 'error' | 'warn' | 'debug';
declare class Logger {
    private static instance;
    constructor();
    log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void;
    info(message: string, metadata?: Record<string, unknown>): void;
    error(message: string, metadata?: Record<string, unknown>): void;
    warn(message: string, metadata?: Record<string, unknown>): void;
    debug(message: string, metadata?: Record<string, unknown>): void;
}
export declare const logger: Logger;
export {};
