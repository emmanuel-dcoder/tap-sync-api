import { Controller, Post, Body, Headers, Req, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { OrderService } from 'src/order/services/order.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly orderService: OrderService,
  ) {}

  /**
   * Initialize a new payment with Paystack.
   * Creates a pending transaction and returns a payment URL.
   */
  @Post('initialize')
  @ApiOperation({
    summary: 'Initialize payment with Paystack',
    description:
      'Starts a payment process using Paystack. Returns an authorization URL to redirect the user to Paystack’s payment page.',
  })
  @ApiBody({
    type: CreatePaymentDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Payment initialized successfully.',
    schema: {
      example: {
        status: true,
        message: 'Authorization URL created',
        data: {
          authorization_url: 'https://checkout.paystack.com/1ab23cd4ef',
          access_code: '1ab23cd4ef',
          reference: 'TX-1697733214000',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request payload' })
  async initialize(@Body() body: CreatePaymentDto) {
    return this.paymentService.initializePayment(body);
  }

  /**
   * Paystack webhook endpoint to verify payment.
   * Called automatically by Paystack after transaction completion.
   */
  @Post('webhook')
  @ApiOperation({
    summary: 'Handle Paystack webhook',
    description:
      'Webhook endpoint that Paystack calls after a payment is processed. Verifies the transaction and creates an order if payment was successful.',
  })
  @ApiHeader({
    name: 'x-paystack-signature',
    description: 'Signature used to verify the webhook payload from Paystack',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook received successfully',
    schema: {
      example: { received: true },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid signature or payload',
  })
  async webhook(
    @Req() req,
    @Res() res,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const payload = req.body;

    const transaction = await this.paymentService.verifyWebhook(
      payload,
      signature,
    );

    if (transaction && transaction.status === 'success') {
      await this.orderService.createOrder({
        userId: `${transaction.userId}`,
        duration: transaction.duration,
      });
    }

    return res.status(200).json({ received: true });
  }
}
