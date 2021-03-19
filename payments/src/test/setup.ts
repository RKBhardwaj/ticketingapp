import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}

jest.mock('../natsWrapper');
process.env.STRIPE_KEY = 'sk_test_Ir4YTryaXUc0RioKSAlczHR0';

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});


global.signin = (id?: string) => {
  //Build a jwt payload { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'testing@test.com'
  };
  //Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //Build a session object { jwt: MY_JWT }
  const session = { jwt: token };

  //Turn that session in JSON
  const sessionJSON = JSON.stringify(session);

  //Take JSON and encode it as base 64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  //return  a string that the cookie with the encode data
  return [`express:sess=${base64}`];
};
