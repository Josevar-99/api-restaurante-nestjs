import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common'; // CAMBIO: + ParseUUIDPipe
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { UpdateAvailabilityDto } from './dto/update-availability.dto.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }


  @Get('menu')
  findMenu() {
    return this.productsService.findAllForMenu();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { // CAMBIO: ParseUUIDPipe
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) { // CAMBIO
    return this.productsService.update(id, dto);
  }

  @Patch(':id/status')
  changeStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStatusDto) { // CAMBIO
    return this.productsService.changeStatus(id, dto.status);
  }

  @Patch(':id/availability')
  changeAvailability(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAvailabilityDto) { // CAMBIO
    return this.productsService.changeAvailability(id, dto.availability);
  }
}