import { User } from "../../models";
import bcrypt from "bcrypt";
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find_all();
    res.json(users);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.find_by_id(req.params.id);
    res.json(user);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  try {
    const user_data = { ...req.body };
    delete user_data.password;
    user_data.hashed_password = await bcrypt.hash(req.body.password, 10);
    const user = await User.create(user_data);
    res.json(user);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await User.find_by_id(req.params.id);
    await user?.update(req.body);
    res.json(user);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.find_by_id(req.params.id);
    const num_deleted = await user?.delete();
    res.json(num_deleted);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

export const user_router = router;
