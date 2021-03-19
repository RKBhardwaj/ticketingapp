import request from 'supertest';
import { app } from '../../app';

it('fails when a email that does not exit is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'tesing@test.com',
      password: 'password'
    })
    .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testing@test.com',
      password: 'password'
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'testing@test.com',
      password: 'password123'
    })
    .expect(400);
});

it('gives a cookie when provided a correct credientials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testing@test.com',
      password: 'password'
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'testing@test.com',
      password: 'password'
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});