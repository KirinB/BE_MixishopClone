import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

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

    //
    const orderCode = this.config.get('MOMO_PARTNER_CODE') + Date.now();

    const momoRes = await this.payment(totalPrice, orderCode);

    // Giao dịch: tạo đơn hàng + chi tiết đơn hàng + cập nhật tồn kho
    const result = await this.prisma.$transaction(async (tx) => {
      // Tạo đơn hàng
      const order = await tx.order.create({
        data: {
          user_id: userId,
          total_price: totalPrice,
          status: 'Pending', // mặc định
          order_code: orderCode,
          payment_url: momoRes.payUrl,
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
        order_code: order.order_code,
      };
    });

    if (!result.order_code) {
      throw new BadRequestException('Order code không hợp lệ!');
    }

    return {
      ...result,
      payUrl: momoRes.payUrl,
    };
  }

  async findAll(page: number, pageSize: number, search: string) {
    const skip = (page - 1) * pageSize;

    // Tạo điều kiện tìm kiếm
    const whereCondition = search
      ? {
          OR: [
            {
              order_code: {
                contains: search,
              },
            },
            {
              user: {
                name: {
                  contains: search,
                },
              },
            },
            {
              user: {
                email: {
                  contains: search,
                },
              },
            },
          ],
        }
      : {};

    // Lấy tổng số item phù hợp
    const totalItem = await this.prisma.order.count({
      where: whereCondition,
    });

    // Tính tổng số trang
    const totalPage = Math.ceil(totalItem / pageSize);

    // Lấy dữ liệu kèm user
    const items = await this.prisma.order.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: {
        created_at: 'desc', // hoặc tuỳ bạn sắp xếp
      },
    });

    return {
      page,
      pageSize,
      totalPage,
      totalItem,
      items: items || [],
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new BadRequestException(`Không tìm thấy đơn hàng với Id: ${id}`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    // Nếu có userId từ FE, thì sử dụng luôn userId đó
    if (updateOrderDto.user_id) {
      const userId = updateOrderDto.user_id;
    }
    // Nếu không có userId mà có email, thì tìm userId từ email
    else if (updateOrderDto.email) {
      const user = await this.prisma.user.findUnique({
        where: { email: updateOrderDto.email },
      });

      if (!user) {
        throw new BadRequestException(`Không tồn tại người dùng này`);
      }

      // Gán userId vào DTO
      updateOrderDto.user_id = user.id;
    }

    const updateData: Partial<UpdateOrderDto> = {
      ...updateOrderDto,
      email: undefined,
    };

    // Chỉ cập nhật userId, không truyền email vào đây
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateData,
    });

    return updatedOrder;
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.order.delete({
      where: {
        id,
      },
    });
    return `Xóa đơn hàng thành công`;
  }

  async payment(amount: number, orderId: string) {
    //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
    //parameters
    var accessKey = this.config.get('MOMO_ACCESS_KEY');
    var secretKey = this.config.get('MOMO_SECRET_KEY');
    var orderInfo = 'Mua hàng tại MixiShop';
    var partnerCode = this.config.get('MOMO_PARTNER_CODE');
    var redirectUrl = `${this.config.get('MOMO_REDIRECT_URL')}?orderCode=${orderId}`;
    var ipnUrl = this.config.get('MOMO_IPN_URL');
    var requestType = 'payWithMethod';
    var amount = amount;
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

  async callback(body: any) {
    const {
      amount,
      extraData,
      message,
      orderId,
      orderInfo,
      orderType,
      partnerCode,
      payType,
      requestId,
      responseTime,
      resultCode,
      transId,
    } = body;

    if (resultCode !== 0) {
      throw new BadRequestException(`Thanh toán thất bại!`);
    }

    const order = await this.prisma.order.findFirst({
      where: {
        order_code: orderId,
        status: 'Pending',
        total_price: body.amount,
      },
    });

    if (!order) {
      throw new BadRequestException(`Không tìm thấy đơn hàng hợp lệ!`);
    }

    var accessKey = this.config.get('MOMO_ACCESS_KEY');
    var secretKey = this.config.get('MOMO_SECRET_KEY');
    const rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&message=' +
      message +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&orderType=' +
      orderType +
      '&partnerCode=' +
      partnerCode +
      '&payType=' +
      payType +
      '&requestId=' +
      requestId +
      '&responseTime=' +
      responseTime +
      '&resultCode=' +
      resultCode +
      '&transId=' +
      transId;
    const crypto = require('crypto');
    var signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== body.signature) {
      throw new BadRequestException(`Có gì đó không đúng ! ::004`);
    }

    await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: 'Completed',
      },
    });
  }

  async checkStatusMomo(orderCode: string) {
    if (!orderCode) {
      throw new BadRequestException(`Vui lòng kiểm tra orderCode`);
    }

    const partnerCode = this.config.get('MOMO_PARTNER_CODE');
    const accessKey = this.config.get('MOMO_ACCESS_KEY');
    const secretKey = this.config.get('MOMO_SECRET_KEY');

    const rawSignature = `accessKey=${accessKey}&orderCode=${orderCode}&partnerCode=${partnerCode}&requestId=${orderCode}`;

    const crypto = require('crypto');

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = JSON.stringify({
      partnerCode,
      requestId: orderCode,
      orderCode,
      signature,
      lang: 'vi',
    });

    const options = {
      method: 'POST',
      url: 'https://test-payment.momo.vn/v2/gateway/api/query',
      headers: {
        'Content-Type': 'application/json',
      },
      data: requestBody,
    };

    let result = await axios(options);

    return result.data;
  }

  async checkStatus(orderCode: string) {
    if (!orderCode || typeof orderCode !== 'string') {
      throw new BadRequestException('Mã đơn hàng không hợp lệ');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        order_code: orderCode,
        status: 'Completed',
      },
    });

    if (!order) {
      throw new BadRequestException(`Không tìm thấy đơn hàng hợp lệ`);
    }

    return order;
  }

  async getOrderByUserId(userId: number, page: string, pageSize: string) {
    const currentPage = parseInt(page, 10) || 1;
    const limit = parseInt(pageSize, 10) || 10;
    const skip = (currentPage - 1) * limit;

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: {
          user_id: userId,
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.order.count({
        where: {
          user_id: userId,
        },
      }),
    ]);

    return {
      page,
      pageSize,
      totalPages: Math.ceil(total / limit),
      totalItem: total,
      currentPage,
      items: orders || [],
    };
  }
}
