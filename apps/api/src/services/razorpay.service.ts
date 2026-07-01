import Razorpay from 'razorpay';
import crypto from 'crypto';
import logger from '../infrastructure/logger/logger';

export class RazorpayService {
  private instance: any;
  private isConfigured: boolean = false;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      this.instance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
      this.isConfigured = true;
    } else {
      logger.warn('Razorpay Integration is not configured. Falling back to mock payments.');
    }
  }

  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    if (!this.isConfigured) {
      const orderId = `order_${Math.random().toString(36).substring(2, 15)}`;
      return {
        id: orderId,
        amount: amount * 100, // Razorpay amount is in paise
        currency,
        receipt,
        status: 'created'
      };
    }

    try {
      const response = await this.instance.orders.create({
        amount: amount * 100, // paise
        currency,
        receipt,
        payment_capture: 1
      });
      return response;
    } catch (error) {
      logger.error({ error }, 'Failed to create Razorpay order. Falling back to mock order.');
      const orderId = `order_failed_${Math.random().toString(36).substring(2, 10)}`;
      return {
        id: orderId,
        amount: amount * 100,
        currency,
        receipt,
        status: 'created'
      };
    }
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!this.isConfigured) {
      return true;
    }

    try {
      const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(`${orderId}|${paymentId}`);
      const generatedSignature = hmac.digest('hex');
      return generatedSignature === signature;
    } catch (error) {
      logger.error({ error }, 'Razorpay signature verification encountered an error.');
      return false;
    }
  }

  verifyWebhookSignature(payloadString: string, signature: string): boolean {
    if (!this.isConfigured) {
      return true;
    }

    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(payloadString);
      const generatedSignature = hmac.digest('hex');
      return generatedSignature === signature;
    } catch (error) {
      logger.error({ error }, 'Razorpay webhook signature verification encountered an error.');
      return false;
    }
  }
}

export const razorpayService = new RazorpayService();
export default razorpayService;
