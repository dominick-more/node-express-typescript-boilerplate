import httpStatus from 'http-status';
import { FilterQuery } from 'mongoose';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';
import { IUser } from '../models/user.model';
import { PaginateOptions } from '../models/plugins/paginate.plugin';

export const createUser = catchAsync(async (req, res): Promise<void> => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const paginateOptionsKeys: readonly (keyof PaginateOptions)[] = ['limit', 'page', 'populate', 'sortBy'];

export const getUsers = catchAsync(async (req, res): Promise<void> => {
  const filter: FilterQuery<IUser> = pick(req.query, ['name', 'role']) as FilterQuery<IUser>;
  const options = paginateOptionsKeys.reduce<PaginateOptions>(
    (accumulator: PaginateOptions, key: keyof PaginateOptions): PaginateOptions => {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        const value = req.query[key];
        if (value !== null && value !== undefined) {
          accumulator[key] = String(value);
        }
      }
      return accumulator;
    },
    {}
  );
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

export const getUser = catchAsync(async (req, res): Promise<void> => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

export const updateUser = catchAsync(async (req, res): Promise<void> => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

export const deleteUser = catchAsync(async (req, res): Promise<void> => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});
