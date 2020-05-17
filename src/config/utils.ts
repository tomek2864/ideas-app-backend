import passport from "passport";
import passportLocal from "passport-local";
import jwt from "jsonwebtoken";
import { Request, NextFunction } from "express";

import { User, UserDocument } from "../models/schema/User";

const LocalStrategy = passportLocal.Strategy;

const signToken = (user: UserDocument) => {
  return jwt.sign(
    {
      _id: user._id, //only id in jwt
    },
    process.env.JWT_SECRET,
    {
      expiresIn: 604800,
    },
  );
};

/**
 * Sign in using Email and Password.
 *
 */
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        // Doesnt share that email exist in db
        //return done(undefined, false, { message: `Email ${email} not found.` });
        return done(undefined, false, { message: "Invalid email or password." });
      }
      user.comparePassword(password, (err: Error, isMatch: boolean) => {
        if (err) {
          return done(err);
        }
        if (isMatch) {
          return done(undefined, user);
        }
        return done(undefined, false, { message: "Invalid email or password." });
      });
    });
  }),
);

export const setup = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  passport.serializeUser<any, any>((user, done) => {
    done(undefined, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  });
};

export const login = (req: Request, user: UserDocument) => {
  return new Promise((resolve, reject) => {
    req.login(user, { session: false }, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve(signToken(user));
    });
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkIsInRole = (...roles: Array<string>) => (req: any, res: any, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).send("UNAUTHORIZED");
  }

  const hasRole = roles.find((role: string) => req.user.userType === role);
  if (!hasRole) {
    return res.status(401).send("UNAUTHORIZED");
  }

  return next();
};
