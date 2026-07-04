import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { IAuthRequest } from "./auth.guard";
import { Reflector } from "@nestjs/core";



@Injectable()
export class AuthorizationGuard implements CanActivate{

    constructor(
        private readonly reflector:Reflector  //to access metadata in controller
    ){

    }



    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

        let req!:IAuthRequest
        const contextType = context.getType()
        switch (contextType) {
            case "http":
                req = context.switchToHttp().getRequest()
                break;
        
            default:
                break;
        }

        const roles = this.reflector.get("roles",context.getHandler())
        console.log(roles);
        
        const user = req.user
        if(!roles.includes(user?.role)){
            throw new UnauthorizedException()
        }








        return true
        
    }
    
}