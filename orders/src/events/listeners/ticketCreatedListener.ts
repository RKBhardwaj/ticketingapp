import { Message } from 'node-nats-streaming';
import { EventSubjects, Listener, TicketCreatedEvent } from '@rvhopstek/common';
import { Ticket } from '../../models/ticket';
import { QueueGroupName } from './listenersConstant';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject: EventSubjects.TicketCreated = EventSubjects.TicketCreated;
  queueGroupName = QueueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], message: Message) {
    const { id, title, price } = data;
    const ticket = Ticket.build({
      id,
      title,
      price
    });
    await ticket.save();

    message.ack();
  }
}