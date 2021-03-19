import { EventSubjects, Listener, OrderCreatedEvent } from '@rvhopstek/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { QueueGroupName } from './listenersConstant';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: EventSubjects.OrderCreated = EventSubjects.OrderCreated;
  queueGroupName = QueueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version
    });
    await order.save();

    msg.ack();
  }
}