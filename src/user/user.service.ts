import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { AuthService } from 'src/auth/auth.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      if (createUserDto.username.includes(' ')) {
        throw new HttpException('Username cannot contain spaces', 400);
      }
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: createUserDto.username.toLocaleLowerCase() },
            { email: createUserDto.email.toLocaleLowerCase() },
          ],
        },
      });
      if (user) {
        console.log('user already exists');
        throw new HttpException('Username or Email already exist', 400);
      }

      this.authService.validatePassword(createUserDto.password);

      const hashPassword = await argon.hash(createUserDto.password);
      createUserDto.password = hashPassword;

      const { password, ...newUser } = await this.prisma.user.create({
        data: {
          email: createUserDto.email.toLocaleLowerCase(),
          username: createUserDto.username.toLocaleLowerCase(),
          role: Role.TREKKER,
          ...createUserDto,
        },
      });
      return { message: 'Created User Successfully', data: newUser };
    } catch (err) {
      throw new HttpException(
        'Something Went Wrong Creating User',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    try {
      return this.prisma.user.findMany();
    } catch (error) {
      throw new HttpException('Cannot find all users', 404);
    }
  }

  findOne(id: number) {
    try {
      return this.prisma.user.findUnique({ where: { id: id } });
    } catch (error) {
      throw new HttpException('Cannot find user by id', 404);
    }
  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new HttpException('User not found', 404);
      return { message: 'Found User', data: user };
    } catch (err) {
      throw new HttpException(
        'Something Went Wrong Finding User',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  update(id: number, updateUserDto: UpdateUserDto) {
    try {
      return this.prisma.user.update({
        data: updateUserDto,
        where: { id: id },
      });
    } catch (error) {
      throw new HttpException('Cannot update user by id', 404);
    }
  }

  remove(id: number) {
    try {
      return this.prisma.user.delete({
        where: { id: id },
      });
    } catch (error) {
      throw new HttpException('Cannot delete user by id', 404);
    }
  }
}
