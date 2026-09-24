import { ApiProperty } from "@nestjs/swagger"

export class HealthResponseDto {
    @ApiProperty({ example: 'ok'})
    status:string
    @ApiProperty({ example: 'restaurant-api'})
    service:string
}
