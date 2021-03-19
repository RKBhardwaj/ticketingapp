import { OrderCancelledEvent, OrderStatus } from '@rvhopstek/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../natsWrapper'
import { OrderCancelledListener } from '../OrderCancelledListener'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 100,
    userId: 'adfadsfadsf',
    status: OrderStatus.Created
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
    }
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg, order };
};

it('should update the order status to cancelled', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('should call acknowledge method', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});