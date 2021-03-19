import { Listener, ExpirationCompleteEvent, EventSubjects, OrderStatus } from '@rvhopstek/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/orderCancelledPublisher';
import { QueueGroupName } from './listenersConstant';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: EventSubjects.ExpirationComplete = EventSubjects.ExpirationComplete;
  queueGroupName = QueueGroupName;
  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');
    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Cancelled
    });
    await order.save();
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    });

    msg.ack();
  }
}