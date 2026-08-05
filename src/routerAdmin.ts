import express from "express";
import storeController from "./controllers/store.controller";
const routerAdmin = express.Router();

routerAdmin.get("/", storeController.goHome);

routerAdmin.get("/login", storeController.getLogin);

routerAdmin.get("/signup", storeController.getSignup);


export default routerAdmin;