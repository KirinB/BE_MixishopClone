import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../auth/decorater/Public';
import { createLinkOrder } from './dto/createLink-order.dto';
import { SkipPerMission } from '../auth/decorater/Permission';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @SkipPerMission()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req: any, @Body() data: CreateOrderDto) {
    const userId = req.user.id;
    return this.orderService.create(userId, data.items);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search: string = '',
  ) {
    return this.orderService.findAll(+page, +pageSize, search);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }

  @Post('payment')
  payment(@Body() data: createLinkOrder) {
    return this.orderService.payment(data.totalPrice, data.orderCode);
  }

  @Public()
  @Post('callback')
  callback(@Body() body: any) {
    return this.orderService.callback(body);
  }

  @Public()
  @Post('check-status')
  checkStatus(@Query('orderCode') orderCode: string) {
    return this.orderService.checkStatus(orderCode);
  }

  @Post('check-momo-code')
  checkMomoCode(@Query('orderCode') orderCode: string) {
    return this.orderService.checkStatusMomo(orderCode);
  }

  @SkipPerMission()
  @UseGuards(AuthGuard('jwt'))
  @Get('user')
  getOrderByUser(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const userId = req.user.id;
    return this.orderService.getOrderByUserId(userId, page, pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }
}
