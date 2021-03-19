import { Listener, OrderCancelledEvent, EventSubjects } from '@rvhopstek/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './listenerConstant';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticketUpdatedPublisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: EventSubjects.OrderCancelled = EventSubjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    //Throw error if ticket is not found
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    //update the orderId property to undefined
    ticket.set({ orderId: undefined });

    //save the ticket
    await ticket.save();

    //publish the ticket updated event
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      userId: ticket.userId,
      price: ticket.price,
      title: ticket.title,
      version: ticket.version,
    });

    //Acknowledge the method
    msg.ack();
  }
}
