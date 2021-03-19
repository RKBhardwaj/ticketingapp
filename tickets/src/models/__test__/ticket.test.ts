import { Ticket } from '../ticket';

it('implements optimistics concurrency control', async (done) => {
  //Create an instance of ticket
  const ticket = Ticket.build({
    title: 'Movie',
    price: 112,
    userId: '122'
  });
  //save the ticket to the db
  await ticket.save();

  //fetch the ticket twice
  const ticketFirst = await Ticket.findById(ticket.id);
  const ticketSecond = await Ticket.findById(ticket.id);

  //make two seperate changes to the tickets we fetched
  ticketFirst!.set({ price: 10 });
  ticketSecond!.set({ price: 15 });

  //save the first fetched ticket
  await ticketFirst!.save();

  //save the second fetched ticket and expect an error
  // expect(async () => {
  //   await ticketSecond!.save();
  // }).toThrow();

  try {
    await ticketSecond!.save();
  } catch (err) {
    return done();
  }
  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'Movie',
    price: 112,
    userId: '122'
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});