import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MenuService } from './menu.service.js';

@Controller('menu')
@ApiTags('Menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar el menú completo del restaurante' })
  @ApiResponse({
    status: 200,
    description:
      'Retorna las categorías ACTIVE con sus productos ACTIVE, organizados por categoría.',
  })
  findMenu() {
    return this.menuService.findMenu();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Consultar las categorías activas del menú' })
  @ApiResponse({
    status: 200,
    description: 'Retorna únicamente las categorías ACTIVE.',
  })
  findCategories() {
    return this.menuService.findCategories();
  }

  @Get('categories/:categoryId/products')
  @ApiOperation({
    summary: 'Consultar los productos activos de una categoría',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'UUID de la categoría',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna los productos ACTIVE de la categoría.',
  })
  @ApiResponse({
    status: 404,
    description: 'La categoría no existe o no está activa.',
  })
  findCategoryProducts(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ) {
    return this.menuService.findCategoryProducts(categoryId);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Consultar el detalle de un producto del menú' })
  @ApiParam({
    name: 'id',
    description: 'UUID del producto',
  })
  @ApiResponse({
    status: 200,
    description:
      'Retorna el producto ACTIVE y su categoría activa, indicando su disponibilidad.',
  })
  @ApiResponse({
    status: 404,
    description: 'El producto no existe, está inactivo o no está disponible en el menú.',
  })
  findProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.findProduct(id);
  }
}
