import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@rvhopstek/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PaymentCreatedPublisher } from '../events/publishers/paymentCreatedPublisher';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { natsWrapper } from '../natsWrapper';
import { stripe } from '../stripe';

const router = express.Router();

router.post('/api/payments', requireAuth, [
  body('token')
    .not()
    .isEmpty(),
  body('orderId')
    .not()
    .isEmpty()
    .withMessage('Order id is required for making payment')
], validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Payment cannot be done for cancelled order');
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    });
    //Creating a payment record
    const payment = Payment.build({
      orderId,
      stripeId: charge.id
    });
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    });

    res.status(201).send({ success: true });
  });


export { router as doPaymentRouter };