import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@rvhopstek/common';
import { doPaymentRouter } from './routes/doPayment';

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test',
}));

//Adding current User middleware
app.use(currentUser);

app.use(doPaymentRouter);
//For synchronus route
// app.all('*', () => {
//   throw new NotFoundError();
// });

//For asynchronous we need to use next method availabe in express
// app.all('*', async (req, res, next) => {
//   next(new NotFoundError());
// });

//For asynchronous method, if we didn't want to use next method, instead want to use throw keyword
//we need to use express-async-errors
app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };