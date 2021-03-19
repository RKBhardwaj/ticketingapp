import { Publisher, EventSubjects, OrderCreatedEvent } from '@rvhopstek/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject: EventSubjects.OrderCreated = EventSubjects.OrderCreated;
}