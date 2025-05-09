import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UploadCloudService } from '../upload-cloud/upload-cloud.service';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';

@Injectable()
export class ProductTypeService {
  constructor(
    private prisma: PrismaService,
    private upload: UploadCloudService,
  ) {}
  async create(createProductTypeDto: CreateProductTypeDto, file: any) {
    console.log({ file });
    if (!file)
      throw new BadRequestException(`Vui lòng upload file với key image`);

    const productExist = await this.prisma.product_type.findUnique({
      where: {
        name: createProductTypeDto.name,
      },
    });

    if (productExist)
      throw new BadRequestException(
        `Đã tồn tại kiểu dữ liệu có tên ${createProductTypeDto.name}`,
      );
    const image = await this.upload.uploadCloud(file);

    const productNew = await this.prisma.product_type.create({
      data: {
        name: createProductTypeDto.name,
        image: image.imgUrl,
      },
    });
    return productNew;
  }

  async findByName(name: string) {
    const productExist = await this.prisma.product_type.findUnique({
      where: {
        name,
      },
    });
    if (!productExist)
      throw new BadRequestException(`Không tìm thấy sản phẩm kiểu ${name}`);

    return productExist;
  }

  async findAll(page: number, pageSize: number, search: string) {
    const where = search?.trim()
      ? {
          name: { contains: search },
        }
      : {};

    const skip = (page - 1) * pageSize;
    const totalItem = await this.prisma.product_type.count({ where });
    const totalPage = Math.ceil(totalItem / pageSize);

    const productType = await this.prisma.product_type.findMany({
      take: pageSize,
      skip,
      orderBy: { created_at: 'desc' },
      where,
    });

    const productTypesWithCount = await Promise.all(
      productType.map(async (productType) => {
        const productCount = await this.prisma.product.count({
          where: { product_type_id: productType.id },
        });

        return {
          ...productType,
          product_count: productCount, // Thêm số lượng sản phẩm vào từng loại sản phẩm
        };
      }),
    );

    return {
      page,
      pageSize,
      totalPage,
      totalItem,
      items: productTypesWithCount || [],
    };
  }

  async findOne(id: number) {
    const productType = await this.prisma.product_type.findUnique({
      where: { id },
    });

    if (!productType)
      throw new BadRequestException(
        `Không tìm thấy kiểu sản phẩm với Id: ${id}`,
      );

    return productType;
  }

  async update(
    id: number,
    updateProductTypeDto: UpdateProductTypeDto,
    file?: any,
  ) {
    await this.findOne(id);

    let imageUrl: string | undefined;

    if (file) {
      const image = await this.upload.uploadCloud(file);
      imageUrl = image.imgUrl ?? '';
    }

    const updateData: Partial<UpdateProductTypeDto> = {
      ...updateProductTypeDto,
      ...(imageUrl && { image: imageUrl }),
    };

    const updatedProductType = await this.prisma.product_type.update({
      where: { id },
      data: updateData,
    });

    return updatedProductType;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.product_type.delete({
      where: {
        id,
      },
    });
    return `Đã xóa kiểu sản phẩm với Id: ${id}`;
  }
}
