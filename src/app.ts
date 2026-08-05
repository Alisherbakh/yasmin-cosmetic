import express from "express";
import path from "path";
import router from "./router"
import routerAdmin from "./routerAdmin";
import { MORGAN_FORMAT } from "./libs/config";
import morgan from "morgan";

/** 1- ENTERENCE */

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(morgan(MORGAN_FORMAT));



/** 2-SESSION */

/** 3-VIEWS */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/** 4-ROUTERS */
app.use("/", router);           // SPA: REACT
app.use("/admin", routerAdmin); // BSSR: EJS

export default app;