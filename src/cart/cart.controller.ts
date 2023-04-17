import { Controller, Get, Delete, Put, Body, Req, Post, UseGuards, HttpStatus } from '@nestjs/common';

// import { BasicAuthGuard, JwtAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';

import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { clientPg } from './dbClient';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService
  ) { }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest) {
    try {
      const userId = req.query.user;

      if (!userId) {
        const carts = await clientPg(`SELECT * FROM carts`);
        const items = await clientPg(`SELECT * FROM cart_items`);
        return {
          statusCode: HttpStatus.OK,
          message: 'OK',
          data: { ...carts.rows[0], items: items.rows },
        }
      }

      const cart = await clientPg(`SELECT * FROM carts WHERE user_id = '${userId}'`);
      const id = cart.rows[0].id;
      const items = await clientPg(`SELECT * FROM cart_items WHERE cart_id = '${id}'`);

      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: { ...cart.rows[0], items: items.rows },
      }
    } catch (error) {
      console.log(error)
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(@Req() req: AppRequest, @Body() body) { // TODO: validate body payload...
    try {
      const { user_id,
        created_at,
        updated_at,
        status,
        cart_id,
        product_id,
        count,
        isNew } = req.body;

      if (isNew) {
        await clientPg(`INSERT INTO carts (user_id, created_at, updated_at, status) values ('${user_id}', '${created_at}', '${updated_at}', '${status}')`);
        await clientPg(`INSERT INTO cart_items (cart_id, product_id, count) values ('${cart_id}', '${product_id}', '${count}')`);
      } else {
        await clientPg(`UPDATE carts SET status='${status}' WHERE user_id='${user_id}'`);
        await clientPg(`UPDATE carts SET updated_at='${updated_at}' WHERE user_id='${user_id}'`);
        await clientPg(`UPDATE cart_items SET count=${count} WHERE cart_id='${cart_id}' AND product_id='${product_id}'`);
      }

      const cart = await clientPg(`SELECT * FROM carts WHERE user_id = '${user_id}'`);
      const items = await clientPg(`SELECT * FROM cart_items WHERE cart_id = '${cart_id}'`);

      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: { ...cart.rows[0], items: items.rows },
      }
    } catch (error) {
      console.log(error);
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Delete()
  clearUserCart(@Req() req: AppRequest) {
    this.cartService.removeByUserId(getUserIdFromRequest(req));

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Post('checkout')
  checkout(@Req() req: AppRequest, @Body() body) {
    const userId = getUserIdFromRequest(req);
    const cart = this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      const statusCode = HttpStatus.BAD_REQUEST;
      req.statusCode = statusCode

      return {
        statusCode,
        message: 'Cart is empty',
      }
    }

    const { id: cartId, items } = cart;
    const total = calculateCartTotal(cart);
    const order = this.orderService.create({
      ...body, // TODO: validate and pick only necessary data
      userId,
      cartId,
      items,
      total,
    });
    this.cartService.removeByUserId(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { order }
    }
  }
}
