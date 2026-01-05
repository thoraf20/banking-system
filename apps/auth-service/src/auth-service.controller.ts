import { Controller, Post, Body } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';

@Controller('auth')
export class AuthServiceController {
  constructor(private readonly authService: AuthServiceService) {}

  @Post('register')
  async register(@Body() data: any) {
    return this.authService.register(data);
  }
}
