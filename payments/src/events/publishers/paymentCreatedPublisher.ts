import { Publisher, PaymentCreatedEvent, EventSubjects } from '@rvhopstek/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
  subject: EventSubjects.PaymentCreated = EventSubjects.PaymentCreated;
}