import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserRepo } from './common/repo/user.repo';
import { SecurityService } from './common/modules/security/security.service';
import { EmailService } from './common/email/email.service';
import { TokenService } from './common/modules/token/token.service';
import { AuthController } from './auth.controller';
import { userModel } from 'src/db/user.schema';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisService } from './common/services/redis.services';

@Module({
  imports: [
  userModel,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],

  providers: [
    AuthService,
    UserRepo,
    SecurityService,
    EmailService,
    TokenService,

    ///fo redis DB
    {
      provide:"RedisClient",
      inject:[ConfigService], //to use env like that "configService.get(variable)"
      async useFactory(configService:ConfigService){
        const redisClient = createClient({
          url:process.env.REDIS_URL
        })
        redisClient.on("error",(err)=>{
          console.log("redis connection failed =>",err);         
        })
        await redisClient.connect()
        console.log("redis connected");
        return redisClient

      }
    },
    RedisService
  ],

  controllers: [AuthController],
})
export class AuthModule {}
