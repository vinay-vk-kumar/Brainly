import {Request,Response, NextFunction } from "express";
import mongoose from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken"

interface newRequest extends Request {
    userId ?: mongoose.Types.ObjectId
}

export const authMiddleware = async (req:newRequest, res:Response, next:NextFunction) => {
    //@ts-ignore


    const token = req.headers.authorization;

    if (!process.env.JWT_SECRET) {
        console.log("JWT_SECRET environment variable is not set");
        res.status(500).json({ 
            message: "Internal server configuration error" 
        });
    }
    //@ts-ignore
    const secret = process.env.JWT_SECRET ? process.env.JWT_SECRET : "secret"
    try{
        //@ts-ignore
        const decoded = await jwt.verify(token,secret);
    
        if(decoded.id){
            req.userId = decoded.id
            next();
        }
        else{
            res.status(403).json({
                message: "You are not logged in"
            })
        }
    } catch(error){
        res.status(403).json({
            success:false,message: "You are not logged in here",error
        })
    }
}                                                                                                   