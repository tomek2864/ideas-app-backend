import express from "express";


import * as authController from "./controllers/auth";
import * as intentionController from "./controllers/intention";
import * as projectController from "./controllers/project";
import * as subprojectController from "./controllers/subproject";
import bodyParser from "body-parser";
import session from "express-session";
import { SESSION_SECRET, MONGODB_URI, PORT } from "./util/secrets";
import mongo from "connect-mongo";
import compression from "compression";  // compresses requests
import passport from "passport";
import lusca from "lusca";
import mongoose from "mongoose";
import bluebird from "bluebird";

import { initialiseAuthentication, utils  } from "./config";
import { UserType } from "./models/schema/User";
import { connectDb } from "./util/database";
const MongoStore = mongo(session);
const mongoUrl = MONGODB_URI;

mongoose.Promise = bluebird;
mongoose.set("debug",true);
connectDb(mongoUrl);
const app = express();
app.set("port", PORT || 3111);

app.get("/test", (req, res) =>
    res.status(200).json({ msg: "Auth service" }),
);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/* app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
        url: mongoUrl,
        autoReconnect: true
    })
})); */
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
app.post("/account/profile", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    authController.postUpdateProfile);

app.post("/account/intention", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    intentionController.createIntention);
app.get("/account/intentions", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    intentionController.getIntentions);
app.get("/account/intention/:id", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    intentionController.getIntention);
app.put("/account/intention/:id", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    intentionController.updateIntention);
app.delete("/account/intention/:id", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    intentionController.deleteIntention);
    
app.post("/account/project", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    projectController.createProject);
app.get("/account/project", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    projectController.getProjects);
app.get("/account/project/:id", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    projectController.getProject);
app.put("/account/project/:id", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    projectController.updateProject);
app.delete("/account/project/:id", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    projectController.deleteProject);

app.post("/account/subproject", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    subprojectController.createSubproject);
app.put("/account/subproject/:id", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    subprojectController.updateSubproject);
app.delete("/account/subproject/:id", 
    passport.authenticate("jwt", { session: false}), 
    utils.checkIsInRole(UserType.FREE, UserType.PREMIUM, UserType.ADMIN), 
    subprojectController.deleteSubproject);


    

export default app;