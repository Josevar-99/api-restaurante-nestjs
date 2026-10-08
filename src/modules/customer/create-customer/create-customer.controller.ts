import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateCustomerService } from './create-customer.service.js';
import { CreateCreateCustomerDto } from './dto/create-create-customer.dto.js';
import { UpdateCreateCustomerDto } from './dto/update-create-customer.dto.js';

@Controller('create-customer')
export class CreateCustomerController {
  constructor(private readonly createCustomerService: CreateCustomerService) {}

  @Post()
  create(@Body() createCreateCustomerDto: CreateCreateCustomerDto) {
    return this.createCustomerService.create(createCreateCustomerDto);
  }

  @Get()
  findAll() {
    return this.createCustomerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.createCustomerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCreateCustomerDto: UpdateCreateCustomerDto,
  ) {
    return this.createCustomerService.update(+id, updateCreateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.createCustomerService.remove(+id);
  }
}
