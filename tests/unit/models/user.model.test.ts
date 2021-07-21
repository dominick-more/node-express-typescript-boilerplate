import faker from 'faker';
import UserModel, { IUser } from '../../../src/models/user.model';

describe('User model', () => {
  describe('User validation', () => {
    let newUser: IUser | undefined;
    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
        isEmailVerified: false,
      };
    });

    test('should correctly validate a valid user', async () => {
      await expect(new UserModel(newUser).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if email is invalid', async () => {
      newUser.email = 'invalidEmail';
      await expect(new UserModel(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password length is less than 8 characters', async () => {
      newUser.password = 'passwo1';
      await expect(new UserModel(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password does not contain numbers', async () => {
      newUser.password = 'password';
      await expect(new UserModel(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password does not contain letters', async () => {
      newUser.password = '11111111';
      await expect(new UserModel(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if role is unknown', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newUser as any).role = 'invalid';
      await expect(new UserModel(newUser).validate()).rejects.toThrow();
    });
  });

  describe('User toJSON()', () => {
    test('should not return user password when toJSON is called', () => {
      const newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
      };
      expect(new UserModel(newUser).toJSON()).not.toHaveProperty('password');
    });
  });
});
