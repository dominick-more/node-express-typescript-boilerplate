import { createLogger, format, transports, Logform, Logger } from 'winston';
import config from './config';

const enumerateErrorFormat: Logform.FormatWrap = format(
  (info: Logform.TransformableInfo): Logform.TransformableInfo | boolean => {
    if (info instanceof Error) {
      return Object.assign(info, { message: info.stack });
    }
    return info;
  }
);

const logger: Logger = createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: format.combine(
    enumerateErrorFormat(),
    config.env === 'development' ? format.colorize() : format.uncolorize(),
    format.splat(),
    format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: [
    new transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

export default logger;
