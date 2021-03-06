import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
    }
  }
}

let mongo: any;

jest.mock('../natsWrapper');

beforeAll(async () => {
  process.env.JWT_KEY = 'asdf';

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


global.signin = () => {
  //Build a jwt payload { id, email }
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
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
