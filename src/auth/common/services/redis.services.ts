import { Inject, Injectable } from "@nestjs/common";
import {RedisArgument, type RedisClientType } from "@redis/client";




@Injectable()
export class RedisService{
    constructor(
       @Inject("RedisClient") private readonly redisClient:RedisClientType
    ){}



    getJtiKey(email:string,jti:string){
        return `users:${email}:jti:${jti}`

    }


    async set({
        key,
        value,
        exType = "EX",
        exValue
    }:{
        key:string,
        value:number | RedisArgument,
        exType?:"EX" | "PX" | "EXAT" | "PXAT",
        exValue?:number
    }){
        const options ={}
        if(exValue){
            Object.assign(options, {
              expiration: {
                type: exType,
                value: exValue,
              },
            });
        }
        return await this.redisClient.set(key,value,options)

    }




    
async get({key}:{key:string}){
    try {
        const data = await this.redisClient.get(key)
        return data

    } catch (error) {
         console.log('redis get error : ',error);
         return undefined
    }
}




async update({key, value}:{key:string,value:number}){
    try {
        const isExist = await this.redisClient.exists(key)
        if (!isExist) {
            return false
        }
        return await this.set({key,value})
        
    } catch (error) {
        console.log('redis update error : ',error);
        return undefined
    }
}




async deletByKey(key:string){
    try {
       return await this.redisClient.del(key)
    } catch (error) {
         console.log('redis delete error : ',error); 
         return undefined       
    }
}



async expire({key,ttl}:{key:string,ttl:number}){
    try {
       return await this.redisClient.expire(key,ttl)
    } catch (error) {
         console.log('redis expire error : ',error);   
         return undefined     
    }
}



async getTtl(key:string){
    try {
       return await this.redisClient.ttl(key)
    } catch (error) {
         console.log('redis ttl error : ',error);     
         return undefined   
    }
}


async getKeyByPrefix(prefix:string){
    try {
       return await this.redisClient.keys(prefix)
    } catch (error) {
         console.log('redis get error : ',error);    
         return undefined    
    }
}


}