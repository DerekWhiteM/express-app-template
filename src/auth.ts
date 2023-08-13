import { Request, Response } from "express";
import { User } from "./models";
import bcrypt from "bcrypt";
import LocalStrategy from "passport-local";
import passport from "passport";

export function check_authenticated(
  req: Request,
  res: Response,
  next: Function
) {
  if (req.isAuthenticated()) return next();
  const header_api_key = req.header("x-api-key");
  if (header_api_key) {
    return header_api_key === process.env.API_KEY
      ? next()
      : res.status(403).json({ message: "Not Authenticated" });
  }
  return res.redirect("/login");
}

export function check_not_authenticated(
  req: Request,
  res: Response,
  next: Function
) {
  return req.isAuthenticated()
    ? res.json({ message: "Already Authenticated" })
    : next();
}

export function init_passport() {
  const authenticate_user = async (
    username: string,
    password: string,
    done: Function
  ) => {
    const hashed_password = await User.find_password_by_username(username);
    if (hashed_password == null) {
      return done(null, false, { 
        username: {
          value: username,
          error: "Invalid username" 
        },
        password: {
          value: password,
          error: null
        }
      });
    }
    try {
      const compare = await bcrypt.compare(password, hashed_password);
      return compare
        ? done(null, await User.find_by_username(username))
        : done(null, false, {
            username: {
              value: username,
              error: null,
            },
            password: {
              value: password, 
              error: "Invalid password"
            }
          });
    } catch (error) {
      return done(error);
    }
  };
  passport.use(
    new LocalStrategy.Strategy(
      { usernameField: "username", passwordField: "password" },
      authenticate_user
    )
  );
  passport.serializeUser((user: any, done: Function) => done(null, user.id));
  passport.deserializeUser((id: number, done: Function) => {
    return done(null, User.find_by_id(id));
  });
}
