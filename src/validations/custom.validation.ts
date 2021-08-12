import { CustomHelpers, CustomValidator, ErrorReport } from 'joi';

export const objectId: CustomValidator<string> = (value: string, helpers: CustomHelpers<string>): string | ErrorReport => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.error('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

export const password: CustomValidator<string> = (value: string, helpers: CustomHelpers<string>): string | ErrorReport => {
  if (value.length < 8) {
    return helpers.error('password must be at least 8 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.error('password must contain at least 1 letter and 1 number');
  }
  return value;
};
