import { BadRequestException, CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Request } from "express";
import { TokenService } from "../modules/token/token.service";
import { IHUser } from "src/db/user.schema";
import { RedisService } from './../services/redis.services';



export interface IAuthRequest extends Request{
    user?:IHUser
}




@Injectable()
export class AuthGuard implements CanActivate{

    constructor(
        private readonly tokenService:TokenService,
        private readonly RedisService:RedisService
        
    ){}



    async canActivate(context: ExecutionContext): Promise<boolean>{

        const contextType = context.getType()
        let authorization!:string
        let req!:IAuthRequest

        switch (contextType) {
            case "http":
                 req = context.switchToHttp().getRequest()
                authorization = req.headers.authorization as string
                break;
        
            default:
                authorization = ""
                break;
        }

        const {user,jti} = await this.tokenService.decodeToken(authorization)

        if(!user){
            throw new BadRequestException("in_valid auth")
        }

        if(jti){
            const jtiKey = this.RedisService.getJtiKey(user.email,jti) as string
            const redisJti = await this.RedisService.get({key:jtiKey})
            if(!redisJti){
                  throw new BadRequestException("login again!")
            }
        }



        req.user = user
        return true

        
    }

}