import winston, { format } from "winston"
const { combine, timestamp, printf, errors } = format;

const plainFormat = printf(({ level, message, label, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

/**
 * Create and configure the logger instance. Discord logging will be done only after client has initialized and logged in.
 */
export default winston.createLogger({
    format: format.combine(
        errors({ stack: true }),
        timestamp(),
        plainFormat
    ),    
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'log.log' })
    ],
    // Log exceptions to file. Also makes process exit when an exception is raised.
    exceptionHandlers: [
      new winston.transports.File({ filename: 'exceptions.log' })
    ]
});
