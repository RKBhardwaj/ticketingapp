import { Publisher, EventSubjects, TicketCreatedEvent } from '@rvhopstek/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject: EventSubjects.TicketCreated = EventSubjects.TicketCreated;
}