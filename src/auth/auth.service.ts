import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { CreateUserDto } from 'src/user/dto/create-user.dto'
import { UserService } from 'src/user/user.service'
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { AuthDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async signUp(createUserDto: CreateUserDto): Promise<any> {
    // Check if user exists
    const userExists = await this.userService.findByEmail(createUserDto.email)
    if (userExists) {
      throw new BadRequestException('User already exists')
    }

    // Hash password
    const hash = await this.hashData(createUserDto.password)
    const newUser = await this.userService.create({
      ...createUserDto,
      password: hash,
    })
    const tokens = await this.getTokens(newUser._id, newUser.email)
    await this.updateRefreshToken(newUser._id, tokens.refreshToken)

    return tokens
  }

  async signIn(data: AuthDto) {
    // Check if user exists
    const user = await this.userService.findByEmail(data.email)
    if (!user) throw new BadRequestException('User does not exist')
    const passwordMatches = await argon2.verify(user.password, data.password)
    if (!passwordMatches) {
      throw new BadRequestException('Password is incorrect')
    }
    const tokens = await this.getTokens(user._id, user.email)
    await this.updateRefreshToken(user._id, tokens.refreshToken)

    return tokens
  }

  async logout(userId: string) {
    await this.userService.update(userId, { refreshToken: null })
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findById(userId)
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied')
    }
    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    )
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied')
    }
    const tokens = await this.getTokens(user.id, user.email)
    await this.updateRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  hashData(data: string) {
    return argon2.hash(data)
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken)
    await this.userService.update(userId, {
      refreshToken: hashedRefreshToken,
    })
  }

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: process.env.SECRET_JWT,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: process.env.SECRET_JWT,
          expiresIn: '7d',
        },
      ),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }
}
