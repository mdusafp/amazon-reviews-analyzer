import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  format: format.simple(),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'log.info' }),
  ],
});

export default logger;
