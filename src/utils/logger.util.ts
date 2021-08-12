import config from '../config/config';
import pJson from '../../package.json';
const { Logger, LOG_LEVELS } = require('package-logger');

const logger = new Logger(pJson.name, config.env, LOG_LEVELS.WARNING_LEVEL);

logger.info(`Logger version is ${logger.getVersion()}`);

export default logger;
