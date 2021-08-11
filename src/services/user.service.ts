import httpStatus from 'http-status';
import { FilterQuery, Types } from 'mongoose';
import { PaginateOptions, QueryResult } from '../models/plugins/paginate.plugin';
import UserModel, { IUser, IUserDoc, IUserLeanDoc, IUserMethods, IUserQueryWithHelper } from '../models/user.model';
import ApiError from '../utils/ApiError';

/**
 * Create a user
 * @param {IUserLeanDoc} userBody
 * @returns {Promise<IUserDoc>}
 */
export const createUser = async (userBody: IUserLeanDoc): Promise<IUserDoc> => {
  if (await UserModel.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return UserModel.create(userBody);
};

/**
 * Query for users
 * @param {FilterQuery<IUser>} filter - Mongo filter
 * @param {PaginateOptions} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult<IUser, IUserMethods>>}
 */
export const queryUsers = async (
  filter: FilterQuery<IUser>,
  options: PaginateOptions
): Promise<QueryResult<IUser, IUserMethods>> => {
  const users =
    typeof UserModel.paginate === 'function'
      ? await UserModel.paginate(filter, options)
      : { results: [], page: 0, limit: 0, totalPages: 0, totalResults: 0 };
  return users;
};

/**
 * Get user by id
 * @param {Types.ObjectId} id
 * @returns {Promise<IUserQueryWithHelper>}
 */
export const getUserById = async (id: string | Types.ObjectId): Promise<IUserQueryWithHelper> => {
  return UserModel.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<IUserQueryWithHelper>}
 */
export const getUserByEmail = async (email: string): Promise<IUserQueryWithHelper> => {
  return UserModel.findOne({ email });
};

/**
 * Update user by id
 * @param {string | Types.ObjectId} id
 * @param {Partial<IUser>} updateBody
 * @returns {Promise<IUserDoc>}
 */
export const updateUserById = async (id: string | Types.ObjectId, updateBody: Partial<IUser>): Promise<IUserDoc> => {
  const user = await getUserById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await UserModel.isEmailTaken(updateBody.email, id))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {string | Types.ObjectId} userId
 * @returns {Promise<IUserDoc>}
 */
export const deleteUserById = async (userId: string | Types.ObjectId): Promise<IUserDoc> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};
