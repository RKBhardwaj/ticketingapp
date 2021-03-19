import { Message } from 'node-nats-streaming';
import { EventSubjects, Listener, TicketUpdatedEvent } from '@rvhopstek/common';
import { Ticket } from '../../models/ticket';
import { QueueGroupName } from './listenersConstant';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject: EventSubjects.TicketUpdated = EventSubjects.TicketUpdated;
  queueGroupName = QueueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], message: Message) {
    const { id, title, price, version } = data;
    const ticket = await Ticket.findByEvent({ id, version });
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    ticket.set({ title, price });
    await ticket.save();

    message.ack();
  }
}