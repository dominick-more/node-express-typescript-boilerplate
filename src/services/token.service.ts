import jwt from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import { Types } from 'mongoose';
import httpStatus from 'http-status';
import config from '../config/config';
import * as userService from './user.service';
import TokenModel, { ITokenDoc } from '../models/token.model';
import ApiError from '../utils/ApiError';
import TokenTypes from '../config/tokens';
import { IUserDoc } from '../models/user.model';

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {TokenTypes} type
 * @param {jwt.Secret} [secret]
 * @returns {string}
 */
export const generateToken = (
  userId: Types.ObjectId,
  expires: Moment,
  type: TokenTypes = TokenTypes.ACCESS,
  secret: jwt.Secret = config.jwt.secret
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {TokenTypes} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<ITokenDoc>}
 */
export const saveToken = async (
  token: string,
  userId: Types.ObjectId,
  expires: Moment,
  type: TokenTypes,
  blacklisted = false
): Promise<ITokenDoc> => {
  const tokenDoc = await TokenModel.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {TokenTypes} type
 * @returns {Promise<ITokenDoc>}
 */
export const verifyToken = async (token: string, type: TokenTypes): Promise<ITokenDoc> => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await TokenModel.findOne({
    token,
    type,
    user: typeof payload.sub === 'function' ? payload.sub() : payload.sub,
    blacklisted: false,
  });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * The security auth tokens type
 */
export type AuthTokens = {
  access: {
    token: string;
    expires: Date;
  };
  refresh: {
    token: string;
    expires: Date;
  };
};

/**
 * Generate new security auth tokens for the specified user
 *
 * @param {IUserDoc} user
 * @returns {Promise<AuthTokens>}
 */
export const generateAuthTokens = async (user: IUserDoc): Promise<AuthTokens> => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, TokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, TokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, TokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
export const generateResetPasswordToken = async (email: string): Promise<string> => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, TokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, TokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {ObjectId} userId
 * @returns {Promise<string>}
 */
export const generateVerifyEmailToken = async (userId: Types.ObjectId): Promise<string> => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(userId, expires, TokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, userId, expires, TokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};
