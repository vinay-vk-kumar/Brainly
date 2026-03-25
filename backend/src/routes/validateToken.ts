import express, { Request, Response } from 'express';
import { UserModel, LinkModel, ContentModel } from "../Db";
import { authMiddleware } from '../middleware/authMiddleware';
import mongoose from 'mongoose';
import jwt, { JwtPayload } from "jsonwebtoken"


const router = express.Router()

router.get("/validate-token", async(req:Request, res,Response) => {

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
            res.status(200).json({success : true, message : "You are already logged in"})
        }
        else{
            res.status(403).json({
                success : false, message: "You are not logged in"
            })
        }
    } catch(error){
        res.status(403).json({
            success:false,message: "You are not logged in here",error
        })
    
    }
})

export default router