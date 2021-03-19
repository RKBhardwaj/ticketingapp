import { OrderCreatedEvent, OrderStatus } from '@rvhopstek/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../natsWrapper'
import { OrderCreatedListener } from '../OrderCreatedListeners'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'adfasdfadsf',
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
      price: 100
    }
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg };
};

it('should create the order', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);
  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it('should call acknowledge method', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});