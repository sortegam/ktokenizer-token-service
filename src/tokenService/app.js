import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
// import cors from 'cors';
// import compression from 'compression';
import helmet from 'helmet';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import route from './router';

// Load configuration from environment
dotenv.config();

const app = express();

// app.use(compression()); // https://www.npmjs.com/package/compression
// app.use(cors()); // https://www.npmjs.com/package/cors
app.use(helmet()); // Adds some API header security ;-)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());

// Define routes
const routedApp = route(app);

// The aws-serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)

export default routedApp;
