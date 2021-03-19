import { Publisher, EventSubjects, OrderCancelledEvent } from '@rvhopstek/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject: EventSubjects.OrderCancelled = EventSubjects.OrderCancelled;
}