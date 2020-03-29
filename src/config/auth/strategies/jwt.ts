import passport from "passport";
import passportJWT from "passport-jwt";
import { to } from "await-to-js";

import { getUserById } from "../../../models/user";

const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

export const strategy = () => {
  const strategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true,
  };

  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verifyCallback = async (req: any, jwtPayload: any, cb: any) => {
    const [err, user] = await to(getUserById(jwtPayload._id));
    if (err) {
      return cb(err);
    }
    req.user = user;
    return cb(null, user);
  };
  passport.use(new JWTStrategy(strategyOptions, verifyCallback));
};


