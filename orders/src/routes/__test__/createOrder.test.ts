import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../natsWrapper';

it('has a route handler listening to /api/orders for post requests', async () => {
  const response = await request(app)
    .post('/api/orders')
    .send({});

  expect(response.status).not.toEqual(404);

});

it('can only be accessed if the user is signed in', async () => {
  await request(app)
    .post('/api/orders')
    .send({})
    .expect(401);
});

it('returns status other than 401 when user is signed in', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId
    })
    .expect(404);
});

it('returns an error if ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Testing',
    price: 20
  });
  await ticket.save();
  const order = Order.build({
    ticket,
    userId: 'tetsgafgsfg',
    status: OrderStatus.Created,
    expiresAt: new Date()
  })
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(400);
});

it('reserves a tickets', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Testing',
    price: 20
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
});

it('publish the order created event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Testing',
    price: 20
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});