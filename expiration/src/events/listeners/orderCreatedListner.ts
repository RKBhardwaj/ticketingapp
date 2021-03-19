import { EventSubjects, Listener, OrderCreatedEvent } from '@rvhopstek/common';
import { Message } from 'node-nats-streaming';
import { QueueGroupName } from './listenerConstant';
import { expirationQueue } from '../../queues/expirationQueue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: EventSubjects.OrderCreated = EventSubjects.OrderCreated;
  queueGroupName = QueueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many milliseconds to process the job:', delay);

    await expirationQueue.add({
      orderId: data.id
    }, {
      delay
    });

    msg.ack();
  }
}