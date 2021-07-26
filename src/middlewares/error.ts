import mongoose from 'mongoose';
import httpStatus from 'http-status';
import { Request, Response } from 'express-serve-static-core';
import { NextFunction, ErrorRequestHandler } from 'express';
import config from '../config/config';
import logger from '../config/logger';
import ApiError from '../utils/ApiError';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorConverter: ErrorRequestHandler = (err: any, _req: Request, _res: Response, next: NextFunction): void => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = String(error.message || httpStatus[statusCode]);
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
export const errorHandler: ErrorRequestHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  /* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = String(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};
