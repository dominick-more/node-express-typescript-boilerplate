import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import faker from 'faker';
import UserModel, { IUser, IUserLeanDoc } from '../../src/models/user.model';

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

export type MongooseObjectIdType = {
  _id?: Types.ObjectId;
};

export const userOne: Readonly<IUser & MongooseObjectIdType> = {
  _id: Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
};

export const userTwo: Readonly<IUser & MongooseObjectIdType> = {
  _id: Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
};

export const admin: Readonly<IUser & MongooseObjectIdType> = {
  _id: Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'admin',
  isEmailVerified: false,
};

export const insertUsers = async (users: IUserLeanDoc[]): Promise<void> => {
  await UserModel.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};
