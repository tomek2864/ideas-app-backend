import express from "express";


import * as authController from "./controllers/auth";
import bodyParser from "body-parser";
import session from "express-session";
import { SESSION_SECRET, MONGODB_URI } from "./util/secrets";
import mongo from "connect-mongo";
import compression from "compression";  // compresses requests
import passport from "passport";
import lusca from "lusca";
import mongoose from "mongoose";
import bluebird from "bluebird";

import { initialiseAuthentication, utils  } from "./config";
import { UserType } from "./models/schema/User";
const MongoStore = mongo(session);
const mongoUrl = MONGODB_URI;


mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true } ).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    // process.exit();
});


const app = express();
app.set("port", process.env.PORT || 3001);

app.get("/test", (req, res) =>
    res.status(200).json({ msg: "Auth service" }),
);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
        url: mongoUrl,
        autoReconnect: true
    })
}));
app.use(passport.initialize());
  initialiseAuthentication(app);
app.use(passport.session());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
initialiseAuthentication(app);

/* app.get("/", authController.index); */
app.post("/login", authController.postLogin);
app.post("/signup", authController.postSignup);
app.post("/account/profile", passport.authenticate("jwt", { session: false}), utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), authController.postUpdateProfile);


export default app;