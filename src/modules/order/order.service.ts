import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}
  async create(userId: number, items: CreateOrderDto['items']) {
    if (!items.length) {
      throw new BadRequestException('Giỏ hàng rỗng!');
    }

    // Lấy danh sách sản phẩm từ DB
    const productIds = items.map((item) => item.product_id);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Tính tổng tiền và chuẩn bị dữ liệu order_detail
    let totalPrice = 0;
    const orderDetails = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        throw new BadRequestException(
          `Sản phẩm với ID ${item.product_id} không tồn tại`,
        );
      }

      // Kiểm tra tồn kho
      if (product.stock_quantity < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm "${product.name}" không đủ hàng (chỉ còn ${product.stock_quantity})`,
        );
      }

      const itemTotal = Number(product.price) * item.quantity;
      totalPrice += itemTotal;

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price: Number(product.price),
      };
    });

    // Giao dịch: tạo đơn hàng + chi tiết đơn hàng + cập nhật tồn kho
    return await this.prisma.$transaction(async (tx) => {
      // Tạo đơn hàng
      const order = await tx.order.create({
        data: {
          user_id: userId,
          total_price: totalPrice,
          status: 'Pending', // mặc định
        },
      });

      // Tạo danh sách order_detail
      await tx.order_detail.createMany({
        data: orderDetails.map((detail) => ({
          ...detail,
          order_id: order.id,
        })),
      });

      // Cập nhật tồn kho cho từng sản phẩm
      for (const item of orderDetails) {
        await tx.product.update({
          where: { id: item.product_id },
          data: {
            stock_quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return {
        message: 'Tạo đơn hàng thành công',
        orderId: order.id,
        total_price: totalPrice,
      };
    });
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async payment(amount: number) {
    //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
    //parameters
    var accessKey = this.config.get('MOMO_ACCESS_KEY');
    var secretKey = this.config.get('MOMO_SECRET_KEY');
    var orderInfo = 'Mua hàng tại MixiShop';
    var partnerCode = this.config.get('MOMO_PARTNER_CODE');
    var redirectUrl =
      'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
    var ipnUrl = this.config.get('MOMO_IPN_URL');
    var requestType = 'payWithMethod';
    var amount = amount;
    var orderId = partnerCode + new Date().getTime();
    var requestId = orderId;
    var extraData = '';
    var orderGroupId = '';
    var autoCapture = true;
    var lang = 'vi';

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&redirectUrl=' +
      redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType;
    //puts raw signature
    console.log('--------------------RAW SIGNATURE----------------');
    console.log(rawSignature);
    //signature
    const crypto = require('crypto');
    var signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
    console.log('--------------------SIGNATURE----------------');
    console.log(signature);

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
    });

    const options = {
      method: 'POST',
      url: 'https://test-payment.momo.vn/v2/gateway/api/create',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };

    let result: any;
    try {
      result = await axios(options);
      return result.data;
    } catch (error) {
      throw new BadRequestException('Có gì đó xảy ra');
    }
  }

  callback(body: any) {
    console.log(body);
    console.log(this.config.get('PORT'));
    return 'ok';
  }
}
