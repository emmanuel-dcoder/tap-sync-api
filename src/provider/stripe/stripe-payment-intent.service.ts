import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { envConfig } from 'src/core/config/env.config';
import Stripe from 'stripe';

@Injectable()
export class StripePaymentIntentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(envConfig.stripe.key);
  }

  async createPaymentIntent(amount: number) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
      });
      return paymentIntent;
    } catch (error) {
      throw new InternalServerErrorException(
        'Stripe Payment Intent creation failed',
      );
    }
  }

  async verifyPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      throw new InternalServerErrorException(
        'Stripe Payment Intent verification failed',
      );
    }
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      envConfig.stripe.webhookSecret,
    );
  }
}
