import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { HealthResponseDto } from './dto/health.response.dto.js';
import { ApiOperation , ApiResponse } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}


  @ApiOperation({summary: 'Verifica el estado del servicio'})
  @ApiResponse({ status: 200, type: HealthResponseDto })
  @Get()
  check() {
    return this.healthService.getStatus();
  }

}
  
