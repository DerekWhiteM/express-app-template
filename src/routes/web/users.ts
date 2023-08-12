import express from "express";
import { User } from "../../models";
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/create", async (req, res) => res.render("users/create.ejs"));

router.get("/:id", async (req, res) => {
  const user = await User.find_by_id(req.params.id);
  return res.render("users/user.ejs", { user: user });
});

router.get("/", async (req, res) => {
  const users = await User.find_all();
  return res.render("users/users.ejs", { users: users });
});

router.post("/", async (req, res) => {
  const user_data = { ...req.body };
  delete user_data.password;
  user_data.hashed_password = await bcrypt.hash(req.body.password, 10);
  await User.create(user_data);
  res.setHeader("HX-Redirect", "/users");
  return res.sendStatus(200);
});

router.delete("/:id", async (req, res) => {
  const user = await User.find_by_id(req.params.id);
  await user?.delete();
  res.setHeader("HX-Redirect", "/users");
  return res.sendStatus(200);
});

router.put("/:id", async (req, res) => {
  const user = await User.find_by_id(req.params.id);
  await user?.update(req.body);
  res.setHeader("HX-Redirect", "/users");
  return res.sendStatus(200);
});

export const user_router = router;