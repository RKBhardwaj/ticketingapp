import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent, OrderStatus } from '@rvhopstek/common';
import { natsWrapper } from '../../../natsWrapper';
import { ExpirationCompleteListener } from '../expirationCompleteListener';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';


const setup = async () => {
  //Create a listner
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();
  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'alskdfj',
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  //Create a fake data obj
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  };
  //Create a fake msg obj
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  //Return
  return { listener, data, msg, ticket, order };
};

it('updates the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});