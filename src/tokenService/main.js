import awsServerlessExpress from 'aws-serverless-express';
import app from './app';

const appServer = awsServerlessExpress.createServer(app);

export const handler = (event, context) => awsServerlessExpress.proxy(appServer, event, context);
