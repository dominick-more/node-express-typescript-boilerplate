import passport from 'passport';
import httpStatus from 'http-status';
import { Request, Response } from 'express-serve-static-core';
import { NextFunction, RequestHandler } from 'express';
import ApiError from '../utils/ApiError';
import { roleRights } from '../config/roles';
import { IUserDoc } from '../models/user.model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AuthenticateCallback = (err?: any, user?: IUserDoc, info?: any) => Promise<void>;

/* eslint-disable @typescript-eslint/no-explicit-any, no-unused-vars */
const verifyCallback = (
  req: Request,
  resolve: (value: void | PromiseLike<void>) => void,
  reject: (reason?: any) => void,
  requiredRights: string[]
): AuthenticateCallback => {
  /* eslint-enable @typescript-eslint/no-explicit-any, no-unused-vars */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (err?: any, user?: IUserDoc, info?: any): Promise<void> => {
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    req.user = user;
    if (requiredRights.length) {
      const userRights = roleRights.get(user.role);
      const hasRequiredRights = userRights && requiredRights.every((requiredRight) => userRights.includes(requiredRight));
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }
    resolve();
  };
};

const auth =
  (...requiredRights: string[]): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

export default auth;
