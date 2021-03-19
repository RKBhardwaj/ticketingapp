import { Publisher, ExpirationCompleteEvent, EventSubjects } from '@rvhopstek/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: EventSubjects.ExpirationComplete = EventSubjects.ExpirationComplete;
}