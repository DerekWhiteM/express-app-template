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
  const schema_validation = create_schema.safeParse(req.body);
  const fields: any = {};
  Object.keys(req.body).forEach((key) => {
    fields[key] = {
      value: req.body[key],
      error: null,
    };
  });
  if (schema_validation.success) {
    const username_exists = await User.find_by_username(req.body.username);
    const email_exists = await User.find_by_email(req.body.email);
    if (username_exists || email_exists) {
      if (username_exists) fields.username.error = "Username is taken";
      if (email_exists) fields.email.error = "Email is already in use";
      return res.render("partials/user_create.ejs", { fields: fields });
    }
    return next();
  } else {
    schema_validation.error.issues.forEach(
      (issue: ZodIssue) => (fields[issue.path[0]].error = issue.message)
    );
    return res.render("partials/user_create.ejs", { fields: fields });
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
