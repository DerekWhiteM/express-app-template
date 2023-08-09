import { check_authenticated, check_not_authenticated } from "../auth";
import { User } from "../models";
import api from "./api";
import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";

const router = express.Router();

router.use("/api", check_authenticated, api);

router.post("/login", check_not_authenticated, (req, res) => {
  passport.authenticate("local", (error: any, user: User, info: any) => {
    if (error) return res.sendStatus(500);
    if (!user) return res.status(500).json({ message: info.message });
    req.logIn(user, (error) => {
      if (error) return res.sendStatus(500);
      return res.send(`Hello, ${user.username}!`);
    });
  })(req, res);
});

router.post("/change-password", check_authenticated, async (req: any, res) => {
  try {
    const user_id = req.session.passport.user;
    const { current_password, new_password } = req.body;
    const current_hashed_password = await User.find_password_by_id(user_id);
    const compare = current_hashed_password
      ? await bcrypt.compare(current_password, current_hashed_password)
      : false;
    if (!compare) throw "Password incorrect";
    const user = await User.find_by_id(user_id);
    const new_hashed_password = await bcrypt.hash(new_password, 10);
    user?.change_password(new_hashed_password);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

export default router;
