import { Publisher, EventSubjects, TicketUpdatedEvent } from '@rvhopstek/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject: EventSubjects.TicketUpdated = EventSubjects.TicketUpdated;
}