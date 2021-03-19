import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from '@rvhopstek/common';
import { TicketCreatedListener } from '../ticketCreatedListener';
import { natsWrapper } from '../../../natsWrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  //Create an instance of listener
  const listener = new TicketCreatedListener(natsWrapper.client)
  //Creates a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString()
  };
  //create  a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, msg, data };
}


it('Creates and saves a ticket', async () => {
  const { listener, msg, data } = await setup();

  //call onMessage function with data object + message object
  await listener.onMessage(data, msg);

  //write assertions to make sure the ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('Acknowledges the message', async () => {
  const { listener, msg, data } = await setup();

  //call onMessage function with data object + message object
  await listener.onMessage(data, msg);

  //write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});