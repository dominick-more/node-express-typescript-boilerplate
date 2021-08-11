import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),

    MONGO_HOST: Joi.string().required(),
    MONGO_DB: Joi.string().required(),
    MONGO_PORT: Joi.number().required(),
    MONGO_USER: Joi.string().required(),
    MONGO_PASSWORD: Joi.string().required(),
    MONGO_PROTOCOL: Joi.string().required(),

    // MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_SECURE: Joi.boolean().description('Use TLS or upgrade later with STARTTLS'),
    SMTP_REJECT_SELFSIGNED_CERTS: Joi.boolean().description('Accept or Reject self-signed certificates.'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const dbURL = `${envVars.MONGO_PROTOCOL}://${envVars.MONGO_USER}:${envVars.MONGO_PASSWORD}@${envVars.MONGO_HOST}:${envVars.MONGO_PORT}`;
// eslint-disable-next-line no-console
console.info(`@@Mongodb:${dbURL}`);

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    // url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    url: dbURL,
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,

      dbName: envVars.MONGO_DB,
      port: envVars.MONGO_PORT,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      secure: envVars.SMTP_SECURE,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: envVars.SMTP_REJECT_SELFSIGNED_CERTS,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};
