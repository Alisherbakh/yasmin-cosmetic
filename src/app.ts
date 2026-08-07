import cors from "cors";
import express from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { MORGAN_FORMAT } from "./libs/config";

import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
import { T } from "./libs/types/common";

// TCP 2
const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
    uri: String(process.env.MONGO_URL), // DataBase location
    collection: "sessions"             // collection name
});

/** 1-ENTERENCE **/
const app = express();
app.use(express.static(path.join(__dirname, "public"))); //  Middleware Design pattern=>  open Public file tashqi muhitga
app.use("/uploads", express.static("./uploads"));       //  Middleware Design pattern=>  open Uploads file tashqi muhitga
app.use(express.urlencoded({ extended: true }));         // M DP => Traditional Api supporter
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: true,
})
);                                 // M DP => Rest API supporter
app.use(cookieParser());                           //brauzerdan kelayotgan cookielarni oson o'qish,ulardan foydalanishga ishlatiladigan   
app.use(morgan(MORGAN_FORMAT));     // M DP => for Morgan HTTP request konsolda chiroyli qilib ko'rsatib turadi.



/** 2-SESSIONS **/
// Authentication va Authorization

app.use(
    session({
        secret: String(process.env.SESSION_SECRET), 
        cookie: {
            maxAge: 1000 * 3600 * 6, // 6 hours living time
        },
        store: store, //  saving location storage
        resave: true, // user kirganda session living hourni chozilishi 
        saveUninitialized: true, // login bolmagan user bolsa ham saqla deyabmiz(views lar statistica uchun)
    })
);

app.use(function(req, res, next){
    const sessionInstance = req.session as T;
    res.locals.member = sessionInstance.member;
    next();
})

/** 3-VIEWS **/
app.set("views", path.join(__dirname, "views"));
// Sahifalar (vizual fayllar) joylashgan papka manzilini ko'rsatadi (Express fayllarni aynan shu views papkasidan qidiradi). 
app.set("view engine", "ejs");
// HTML ichida dinamik JS kod yozish imkonini beruvchi EJS shablon (view engine) dvigatelini (HTML generatorini) faollashtiradi.


/** 4-ROUTERS **/

app.use("/admin", routerAdmin); // SSR: EJS
app.use("/", router);           // SPA: REACT   Middleware Design Pattern

export default app;