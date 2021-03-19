import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../natsWrapper';

it('return an error 404 if the order is not present in the db', async () => {
  const orderId = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .delete(`/app/orders/${orderId}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404);

});

it('return an error 401 if user try to access different user order', async () => {
  const userOne = global.signin();
  const userTwo = global.signin();
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Testing',
    price: 20
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', userTwo)
    .expect(401);
});

it('return an order with updated status as Cancelled', async () => {
  const user = global.signin();

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Testing 1',
    price: 20
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);

  const updateOrder = await Order.findById(order.id);
  expect(updateOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('publish the cancelled order event', async () => {
  const user = global.signin();

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Testing 1',
    price: 20
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});