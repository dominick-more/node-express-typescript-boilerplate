import Joi from 'joi';
import httpStatus from 'http-status';
import { Request, Response } from 'express-serve-static-core';
import { NextFunction, RequestHandler } from 'express';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';

export type ValidateSchema = {
  body?: boolean | Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
};

const validate =
  (schema: ValidateSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const validSchema = pick(schema, ['body', 'params', 'query']);
    const validSchemaKeys = Object.keys(validSchema);
    const reqKeys: Extract<keyof typeof req, string>[] = Object.keys(req) as Extract<keyof typeof req, string>[];
    const object = pick(
      req,
      reqKeys.filter((value: string) => validSchemaKeys.includes(value))
    );
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(', ');
      return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }
    Object.assign(req, value);
    return next();
  };

export default validate;
