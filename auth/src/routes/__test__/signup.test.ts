import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successfull signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'tesing@test.com',
      password: 'pasword'
    })
    .expect(201);
});

it('return a 400 with a invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'tesing',
      password: 'pasword'
    })
    .expect(400);
});

it('return a 400 with a invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'testing@test.com',
      password: 'pa'
    })
    .expect(400);
});


it('return a 400 with a invalid email or password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testing@test.com',
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
      password: 'password'
    })
    .expect(400);
});


it('return dissallow duplicate email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testing@test.com',
      password: 'password'
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testing@test.com',
      password: 'password123'
    })
    .expect(400);
});

it('sets up a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testing@test.com',
      password: 'password'
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});