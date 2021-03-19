import { EventSubjects, Listener, OrderCancelledEvent, OrderStatus } from '@rvhopstek/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { QueueGroupName } from './listenersConstant';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: EventSubjects.OrderCancelled = EventSubjects.OrderCancelled;
  queueGroupName = QueueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const { id, version } = data;
    const order = await Order.findByEvent({ id, version });
    if (!order) {
      throw new Error('Order not found');
    }
    order.set({
      status: OrderStatus.Cancelled
    });
    await order.save();

    msg.ack();
  }
}