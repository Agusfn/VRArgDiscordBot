import winston, { format } from "winston"

export default winston.createLogger({
    format: format.combine(
        format.timestamp(),
        format.json()
    ),    
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'log.log' })
    ]
});
