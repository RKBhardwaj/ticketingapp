import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './natsWrapper';
import { TicketCreatedListener } from './events/listeners/ticketCreatedListener';
import { TicketUpdatedListener } from './events/listeners/ticketUpdatedListener';
import { ExpirationCompleteListener } from './events/listeners/expirationCompleteListener';
import { PaymentCreatedListener } from './events/listeners/paymentCreatedListener';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be specified');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be specified');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be specified');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be specified');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL Id must be specified');
  }

  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
    natsWrapper.client.on('close', () => {
      console.log('Closing NATS connection');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log('Connected to mongodb');
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log('Listening on Port 3000!!!');
  });
}

start();