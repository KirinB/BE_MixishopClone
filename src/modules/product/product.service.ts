import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadCloudService } from '../upload-cloud/upload-cloud.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private upload: UploadCloudService,
  ) {}
  async create(createProductDto: CreateProductDto, file: any) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn hình ảnh ');
    }

    const product = await this.prisma.product.findUnique({
      where: {
        sku: createProductDto.sku,
      },
    });

    if (product)
      throw new BadRequestException(
        `Đã tồn tại mã sản phẩm Sku: ${createProductDto.sku}`,
      );
    const image = await this.upload.uploadCloud(file);

    return await this.prisma.product.create({
      data: {
        ...createProductDto,
        main_image: image.imgUrl ?? '',
      },
    });
  }

  async findAll(
    page: number,
    pageSize: number,
    search?: string,
    typeId?: number,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest',
  ) {
    const minPriceNumber = minPrice ? +minPrice : undefined;
    const maxPriceNumber = maxPrice ? +maxPrice : undefined;
    const where: any = {};

    // Lọc theo loại sản phẩm (typeId)
    if (typeId) {
      where.product_type_id = { equals: Number(typeId) };
    }

    // Lọc theo từ khóa tìm kiếm (search)
    if (search) {
      where.name = { contains: search };
    }

    // console.log(isNaN(minPriceNumber));

    // // // Lọc theo giá
    if (minPriceNumber !== undefined) {
      where.price = { gte: minPriceNumber };
    }
    if (maxPriceNumber !== undefined) {
      where.price = { ...where.price, lte: maxPrice };
    }

    // Tính toán skip và lấy tổng số item
    const skip = (page - 1) * pageSize;
    const totalItem = await this.prisma.product.count({ where });
    const totalPage = Math.ceil(totalItem / pageSize);

    // Sắp xếp
    const orderBy = sortBy
      ? sortBy === 'price_asc'
        ? { price: 'asc' as Prisma.SortOrder }
        : sortBy === 'price_desc'
          ? { price: 'desc' as Prisma.SortOrder }
          : sortBy === 'newest'
            ? { created_at: 'desc' as Prisma.SortOrder }
            : { created_at: 'asc' as Prisma.SortOrder }
      : { created_at: 'desc' as Prisma.SortOrder };

    // console.log({ orderBy });

    // console.log({ where });
    // Truy vấn dữ liệu
    const products = await this.prisma.product.findMany({
      take: pageSize,
      skip,
      orderBy,
      where: where,
      include: { product_type: true },
    });

    return {
      page,
      pageSize,
      totalPage,
      totalItem,
      items: products || [],
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        product_type: true,
        product_color: {
          include: {
            color: true,
          },
        },
      },
    });
    if (!product)
      throw new BadRequestException(`Không tìm thấy sản phẩm với Id : ${id}}`);
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    const updateData: Partial<UpdateProductDto> = {
      ...updateProductDto,
    };

    const updatedProduct = await this.prisma.product_type.update({
      where: { id },
      data: updateData,
    });

    return updatedProduct;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.product.delete({
      where: {
        id,
      },
    });

    return `Đã xóa sản phẩm với Id: ${id}`;
  }

  async findManyByIds(ids: number[]) {
    const items = await this.prisma.product.findMany({
      where: { id: { in: ids } },
    });

    const totalPrice = items.reduce((sum, item) => sum + +item.price, 0);

    return {
      totalPrice,
      items,
    };
  }
}
