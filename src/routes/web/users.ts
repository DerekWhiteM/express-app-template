import express from "express";
import { User } from "../../models";
import bcrypt from "bcrypt";
import { ZodIssue, z } from "zod";

// Input validation

const create_schema = z.object({
  username: z.string().max(20),
  email: z.string().email(),
  password: z.string().max(50),
});

async function validate_create(req: any, res: any, next: Function) {
  const result = create_schema.safeParse(req.body);
  if (result.success) {
    const fields: any = {};
    if (await User.find_by_username(req.body.username))
      fields["username"] = "Username is taken";
    if (await User.find_by_email(req.body.email))
      fields["email"] = "Email is already in use";
    if (Object.keys(fields).length === 0) return next();
    return res.render("partials/user_create.ejs", {
      values: req.body,
      error: { fields },
    });
  } else {
    const fields: any = {};
    result.error.issues.forEach((issue: ZodIssue) => {
      fields[issue.path[0]] = issue.message;
    });
    return res.render("partials/user_create.ejs", {
      values: req.body,
      error: { fields },
    });
  }
}

// Routes

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

router.post("/", validate_create, async (req, res) => {
  try {
    create_schema.parse(req.body);
    const user_data = { ...req.body };
    delete user_data.password;
    user_data.hashed_password = await bcrypt.hash(req.body.password, 10);
    await User.create(user_data);
    res.setHeader("HX-Redirect", "/users");
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
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
