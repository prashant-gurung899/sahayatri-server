import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Public } from 'src/decorator/public.decorator';
import { LocalAuthGuard } from './guards/local.guard';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {}

  //sign up account
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register User' })
  // @ApiResponse({ status: 201, description: 'Return user .' })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  async register(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return user;
  }

  //User login
  @Public()
  @ApiOperation({ summary: 'Login User' })
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  signin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
