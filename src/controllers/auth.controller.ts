import httpStatus from 'http-status';
import { IUserDoc } from '../models/user.model';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';
import * as tokenService from '../services/token.service';
import * as emailService from '../services/email.service';
import catchAsync from '../utils/catchAsync';

export const register = catchAsync(async (req, res): Promise<void> => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

export const login = catchAsync(async (req, res): Promise<void> => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

export const logout = catchAsync(async (req, res): Promise<void> => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const refreshTokens = catchAsync(async (req, res): Promise<void> => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

export const forgotPassword = catchAsync(async (req, res): Promise<void> => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const resetPassword = catchAsync(async (req, res): Promise<void> => {
  await authService.resetPassword(typeof req.query.token === 'string' ? req.query.token : '', req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

export const sendVerificationEmail = catchAsync(async (req, res): Promise<void> => {
  const reqUser = req.user as IUserDoc;
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(reqUser?.id);
  await emailService.sendVerificationEmail(reqUser?.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const verifyEmail = catchAsync(async (req, res): Promise<void> => {
  await authService.verifyEmail(typeof req.query.token === 'string' ? req.query.token : '');
  res.status(httpStatus.NO_CONTENT).send();
});
