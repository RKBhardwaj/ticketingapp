import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

const createTicket = async (title: string, price: number) => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title,
    price
  });
  await ticket.save();
  return ticket
};

it('fetches orders for the selected user', async () => {
  //Create three tickets
  const ticketOne = await createTicket('Ticket 1', 10);
  const ticketTwo = await createTicket('Ticket 2', 20);
  const ticketThree = await createTicket('Ticket 3', 30);

  const userOne = global.signin();
  const userTwo = global.signin();
  //Create one Order as USer 1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  //Create two orders as user 2
  const { body: order1 } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);

  const { body: order2 } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  //Make request to get Orders for USer 2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);

  //Make sure we only got the orders for user 2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(order1.id);
  expect(response.body[1].id).toEqual(order2.id);
});