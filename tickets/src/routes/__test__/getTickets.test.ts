import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: string, price: number) => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price });
}

it('returns all the list of tickets', async () => {
  await createTicket('Testing 1', 10);
  await createTicket('Testing 2', 20);
  await createTicket('Testing 3', 30);
  await createTicket('Testing 4', 40);
  await createTicket('Testing 5', 50);

  const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200);

  expect(response.body.length).toEqual(5);
});