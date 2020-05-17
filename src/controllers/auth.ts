import async from "async";
import nodemailer from "nodemailer";
import passport from "passport";
import { User, UserDocument } from "../models/schema/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import { check, validationResult } from "express-validator";
import "../config/utils";
import { to } from "await-to-js";
import { login } from "../config/utils";
import { createUser } from "../models/user";
import { UserType } from "../models/schema/User";
import { errorFormatter } from "./helpers";
/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line @typescript-eslint/camelcase
  await check("email", "Email is not valid").isEmail().normalizeEmail({ gmail_remove_dots: false }).run(req);
  await check("password", "Password cannot be blank").isLength({ min: 8 }).run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  passport.authenticate("local", async (err: Error, user: UserDocument, info: IVerifyOptions) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ success: false, msg: info.message });
    }
    const [loginErr, accessToken] = await to(login(req, user));

    if (loginErr) {
      return res.status(400).json({ success: false, msg: "Invalid credentionals" });
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res
        .status(200)
        .cookie("accessToken", accessToken, {
          httpOnly: true,
        })
        .json({
          success: true,
          profile: user.profile,
          role: user.userType,
          email: user.email,
          accessToken /* session: req.session,  redirect: req.session.returnTo,*/,
        });
    });
  })(req, res, next);
};

/**
 * POST /signup
 * Create a new local account.
 */
export const postSignup = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/camelcase
  await check("email", "email_invalid").isEmail().normalizeEmail({ gmail_remove_dots: false }).run(req);
  await check("password", "password_too_short").isLength({ min: 8 }).run(req);
  await check("confirmPassword", "passwords_do_not_match").equals(req.body.password).run(req);

  const errors = validationResult(req).formatWith(errorFormatter);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;
  const [err, user] = await to(
    createUser({
      email,
      password,
      premium: UserType.FREE,
    }),
  );

  if (err) {
    return res.status(400).json({ success: false, errors: [{ msg: "email_exist", param: "email" }] });
  }

  const userToSend = user as UserDocument;

  return res.status(200).json({
    success: true,
    data: {
      email: userToSend.email,
      type: userToSend.userType,
    },
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
export const postUpdateProfile = async (req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line @typescript-eslint/camelcase
  await check("email", "Please enter a valid email address.")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .run(req);
  await check("name").optional().isString().notEmpty().isLength({ max: 150 }).run(req);
  await check("location").optional().isString().notEmpty().isLength({ max: 150 }).run(req);
  await check("website").optional().isString().notEmpty().isLength({ max: 150 }).run(req);
  await check("gender").optional().isString().isIn(["male", "female", "uni"]).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const user = req.user as UserDocument;
  User.findById(user.id, (err, user: UserDocument) => {
    if (err) {
      return next(err);
    }
    user.email = req.body.email || "";
    user.profile.name = req.body.name || "";
    user.profile.gender = req.body.gender || null;
    user.profile.location = req.body.location || "";
    user.profile.website = req.body.website || "";
    user.save((err: WriteError) => {
      if (err) {
        if (err.code === 11000) {
          return res.status(400).json({ success: false, errors: err });
        }
        return next(err);
      }
      return res.status(200).json({ success: true });
    });
  });
};
