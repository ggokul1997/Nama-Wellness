import { Request, Response, NextFunction } from 'express';
import { paymentsService } from './payments.service';
import { razorpayService } from '../../services/razorpay.service';
import { paymentsRepository } from './payments.repository';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleInitiateCoursePayment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await paymentsService.initiateCoursePayment(userId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleInitiateOnboardingPayment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await paymentsService.initiateOnboardingPayment(userId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleInitiateSubscriptionPayment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await paymentsService.initiateSubscriptionPayment(userId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleVerifyPayment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await paymentsService.verifyPayment(userId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetMyPayments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await paymentsService.getMyPayments(userId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetMyOrders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await paymentsService.getMyOrders(userId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetAdminPayments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const status = req.query.status as any;
    const purpose = req.query.purpose as any;
    const result = await paymentsService.getAdminPayments(status, purpose);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetAdminOrders(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await paymentsService.getAdminOrders();
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleRequestRefund(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const orderId = req.params.orderId as string;
    const { reason } = req.body;
    const result = await paymentsService.requestRefund(userId, orderId, reason);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleApproveRefund(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.userId;
    const refundId = req.params.refundId as string;
    const result = await paymentsService.approveRefund(adminId, refundId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleRejectRefund(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.userId;
    const refundId = req.params.refundId as string;
    const { reason } = req.body;
    const result = await paymentsService.rejectRefund(adminId, refundId, reason);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleAdminRefundOverride(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.userId;
    const orderId = req.params.orderId as string;
    const { reason } = req.body;
    const result = await paymentsService.manualRefundOverride(adminId, orderId, reason);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleRazorpayWebhook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const signature = req.headers['x-razorpay-signature'] as string || '';
    const isValid = razorpayService.verifyWebhookSignature(JSON.stringify(req.body), signature);
    if (!isValid) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Signature verification failed' } });
      return;
    }

    const eventId = req.body.id || req.body.event_id || `evt_${Math.random().toString(36).substring(2, 10)}`;
    const eventType = req.body.event || 'unknown';

    // Idempotency
    const existing = await paymentsRepository.findWebhookEvent('razorpay', eventId);
    if (existing) {
      res.status(200).json({ received: true });
      return;
    }

    const webhookEvent = await paymentsRepository.createWebhookEvent({
      gateway: 'razorpay',
      eventId,
      eventType,
      payload: req.body
    });

    // Handle captured payments from webhook
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const gatewayPaymentId = paymentEntity?.id;
      const gatewayOrderId = paymentEntity?.order_id;

      if (gatewayOrderId) {
        let paymentRecord = null;
        if (gatewayPaymentId) {
          paymentRecord = await paymentsRepository.findPaymentByGatewayId(gatewayPaymentId);
        }
        if (!paymentRecord) {
          paymentRecord = await paymentsRepository.findPaymentByGatewayOrderId(gatewayOrderId);
        }

        if (paymentRecord && paymentRecord.status !== 'completed' && gatewayPaymentId) {
          await paymentsService.verifyPayment(paymentRecord.userId, {
            paymentId: paymentRecord.id,
            gatewayPaymentId,
            gatewaySignature: 'webhook_bypass_sig'
          });
        }
      }
    }

    await paymentsRepository.markWebhookProcessed(webhookEvent.id);

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}
