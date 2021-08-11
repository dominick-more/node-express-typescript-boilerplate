import { model, Document, Schema, Types, Model } from 'mongoose';
import toJSON from './plugins/toJSON.plugin';
import TokenTypes from '../config/tokens';

export interface IToken {
  token: string;
  user: Types.ObjectId;
  type: string;
  expires: string;
  blacklisted: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITokenModel extends Model<IToken, Record<string, never>, Record<string, never>> {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ITokenDoc = IToken & Document<Record<string, any>, Record<string, never>, IToken>;

const tokenSchema = new Schema<IToken, ITokenModel>(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [TokenTypes.REFRESH, TokenTypes.RESET_PASSWORD, TokenTypes.VERIFY_EMAIL],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
tokenSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const TokenModel: ITokenModel = model<IToken>('Token', tokenSchema);

export default TokenModel;
