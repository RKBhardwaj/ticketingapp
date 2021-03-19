import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@rvhopstek/common';
import { TicketUpdatedListener } from '../ticketUpdatedListener';
import { natsWrapper } from '../../../natsWrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  //Create an instance of listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  //Create and save a ticket
  const ticket = new Ticket({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Testing 1',
    price: 100,
  });
  await ticket.save();

  //Creates a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'Testing 2',
    price: 200,
    userId: new mongoose.Types.ObjectId().toHexString()
  };

  //create  a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, msg, data, ticket };
}


it('finds a ticket, update it and save it', async () => {
  const { listener, msg, data, ticket } = await setup();

  //call onMessage function with data object + message object
  await listener.onMessage(data, msg);

  //write assertions to make sure the ticket was created
  const newTicket = await Ticket.findById(ticket.id);

  expect(newTicket).toBeDefined();
  expect(newTicket!.title).toEqual(data.title);
  expect(newTicket!.price).toEqual(data.price);
  expect(newTicket!.version).toEqual(data.version);
});

it('Acknowledges the message', async () => {
  const { listener, msg, data } = await setup();

  //call onMessage function with data object + message object
  await listener.onMessage(data, msg);

  //write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack method if the event has skipped version', async () => {
  const { listener, msg, data } = await setup();
  //updating version to some future version
  data.version = 100
  try {
    await listener.onMessage(data, msg);
  } catch (err) {

  }
  expect(msg.ack).not.toHaveBeenCalled();
});
