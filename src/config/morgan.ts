import { Request, Response } from 'express';
import morgan from 'morgan';
import config from './config';
import logger from './logger';

morgan.token('message', (_req: Request, res: Response) => res?.locals?.errorMessage || '');

const getIpFormat = () => (config.env === 'production' ? ':remote-addr - ' : '');
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
  skip: (_req: Request, res: Response): boolean => res.statusCode >= 400,
  stream: {
    write: (message: string): void => {
      logger.info(message.trim());
    },
  },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (_req: Request, res: Response): boolean => res.statusCode < 400,
  stream: {
    write: (message: string): void => {
      logger.error(message.trim());
    },
  },
});

export { successHandler, errorHandler };
