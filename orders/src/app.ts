import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@rvhopstek/common';
import { createOrderRouter, getOrderRouter, getOrdersRouter, deleteOrderRouter } from './routes/index';

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test',
}));

//Adding current User middleware
app.use(currentUser);

//Adding Routes to the applications
app.use(createOrderRouter);
app.use(getOrderRouter);
app.use(getOrdersRouter);
app.use(deleteOrderRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };