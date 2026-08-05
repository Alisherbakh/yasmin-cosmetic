import { Request, Response } from "express";
import { T } from "../libs/types/common";


const storeController: T = {};

 storeController.goHome = (req: Request, res: Response) => {
   try{
       res.send("Home Page");
   } catch (err){
    console.log("Error, goHome:", err);
   }
};

storeController.getLogin = (req: Request, res: Response) => {
   try{
       res.send("Login Page");
   } catch (err){
    console.log("Error, Login:", err);
   }
};

storeController.getSignup = (req: Request, res: Response) => {
   try{
       res.send("Signup Page");
   } catch (err){
    console.log("Error, getSignup:", err);
   }
};


export default storeController;