import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@rvhopstek/common';
import { OrderCreatedListener } from '../orderCreatedListener';
import { natsWrapper } from '../../../natsWrapper';
import { Ticket } from '../../../models/ticket';


const setup = async () => {
  //Create a listerner
  const listener = new OrderCreatedListener(natsWrapper.client);

  //create and save a ticket
  const ticket = Ticket.build({
    title: 'Testing 1',
    price: 100,
    userId: 'ravi'
  });
  await ticket.save();

  //Create a fake data object
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: 'ravi',
    expiresAt: 'adfadfadf',
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  };

  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg, ticket };
};

it('sets the orderid of the ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);

});

it('should acknowledge the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('Publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});