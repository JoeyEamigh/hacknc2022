import { environment as prodEnv } from './src/environment.prod';
import { environment as devEnv } from './src/environment.dev';

const nodeEnv = process.env.NODE_ENV;
const myEnv = process.env.ENV;
let environment: typeof prodEnv;

switch (myEnv) {
  case 'production':
    environment = prodEnv;
    break;
  case 'development':
    environment = devEnv;
    break;
  default:
    environment = devEnv;
}

export default environment;
