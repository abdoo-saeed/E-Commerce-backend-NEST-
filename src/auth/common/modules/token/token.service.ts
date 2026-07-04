import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtSignOptions } from './../../../../../node_modules/@nestjs/jwt/dist/interfaces/jwt-module-options.interface.d';
import { UserRepo } from "../../repo/user.repo";





@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepo
  ) {}



  async generateOTP(
    { payload,secret, options }:
    { payload: Object, secret:string , options: JwtSignOptions },
  ) {
    options.secret = secret
    const token = await this.jwtService.signAsync(payload, options);
    return token
  }



  async verify({token,secret}){

    const payload = await this.jwtService.verifyAsync(token,{secret})
    return payload

  }
  



   async decodeToken (token: string){


      if (!token) {
        throw new UnauthorizedException("token not correct");
    }

    const {email,_id,jti,iat} = await this.verify({token, secret: process.env.ACCESS_TOKEN_SIGNATURE as string}) as {
        email: string,
        jti: string,
        iat: number,
        _id: string
    }

    const user = await this.userRepo.findById(_id)
    if(!user){
        throw new UnauthorizedException("user not found") 
    }
    if(!user.isEmailConfirmed){
        throw new UnauthorizedException("user not confirmed")
    }

    // const tokenKey = revokedTokenKey({
    //     userId:_id,
    //     jti
    //     })

    // const sessionData = await get({key:tokenKey}) as string
    // if(sessionData){
    //     throw new BadRequestExecption("login again,session!!")
    // }

    if(iat*1000 <= user.changedCreditTime?.getTime()){
        throw new BadRequestException("login again,credentials!!")
    }

    
    return {user,jti}
    

}

}