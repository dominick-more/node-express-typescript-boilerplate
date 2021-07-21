import moment from 'moment';
import config from '../../src/config/config';
import TokenTypes from '../../src/config/tokens';
import * as tokenService from '../../src/services/token.service';
import { userOne, admin } from './user.fixture';

const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
export const userOneAccessToken = tokenService.generateToken(userOne._id, accessTokenExpires, TokenTypes.ACCESS);
export const adminAccessToken = tokenService.generateToken(admin._id, accessTokenExpires, TokenTypes.ACCESS);
