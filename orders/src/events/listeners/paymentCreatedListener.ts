import { EventSubjects, Listener, OrderStatus, PaymentCreatedEvent } from '@rvhopstek/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { QueueGroupName } from './listenersConstant';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: EventSubjects.PaymentCreated = EventSubjects.PaymentCreated;
  queueGroupName = QueueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete
    });
    await order.save();
    msg.ack();
  }
}