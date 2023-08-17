import express from "express";
import { User } from "../../models";
import bcrypt from "bcrypt";
import { ZodIssue, z } from "zod";
import isStrongPassword from "validator/lib/isStrongPassword";


// **Permission handling**

async function enforce_read(req: any, res: any, next: Function) {
  const user = await req.user;
  const has_permission = await user?.check_permission("read_users");
  return has_permission ? next() : res.sendStatus(401);
}

async function enforce_write(req: any, res: any, next: Function) {
  const user = await req.user;
  const has_permission = await user?.check_permission("write_users");
  return has_permission ? next() : res.sendStatus(401);
}


// **Input validation**

async function validate_create(req: any, res: any, next: Function) {
  const schema = z.object({
    username: z.string().max(20),
    email: z.string().email(),
    password: z.string().max(50).refine(val => isStrongPassword(val), {
      message: "Weak password"
    }),
  });
  const schema_validation = schema.safeParse(req.body);
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
      return res.render("_partials/create-user.ejs", { fields: fields });
    }
    return next();
  } else {
    schema_validation.error.issues.forEach(
      (issue: ZodIssue) => (fields[issue.path[0]].error = issue.message)
    );
    return res.render("_partials/create-user.ejs", { fields: fields });
  }
}

async function validate_update(req: any, res: any, next: Function) {
  const schema = z.object({
    username: z.string().max(20),
    email: z.string().email(),
  });
  const schema_validation = schema.safeParse(req.body);
  const fields: any = {};
  Object.keys(req.body).forEach((key) => {
    fields[key] = {
      value: req.body[key],
      error: null,
    };
  });
  if (schema_validation.success) {
    const user_by_username = await User.find_by_username(req.body.username);
    const user_by_email = await User.find_by_email(req.body.email);
    if ((user_by_username && req.body.username !== user_by_username.username) || (user_by_email && req.body.email !== user_by_email.email)) {
      if (user_by_username ) fields.username.error = "Username is taken";
      if (user_by_email) fields.email.error = "Email is already in use";
      return res.render("_partials/edit-user.ejs", {
        user: user_by_username ? user_by_username : user_by_email, 
        fields: fields 
      });
    }
    return next();
  } else {
    schema_validation.error.issues.forEach(
      (issue: ZodIssue) => (fields[issue.path[0]].error = issue.message)
    );
    return res.render("_partials/edit-user.ejs", { fields: fields });
  }
}


// **Routes**

const router = express.Router();

// View -- All
router.get("/", enforce_read, async (req, res) => {
  const users = await User.find_all();
  return res.render("users/archive.ejs", { users: users });
});

// View -- Create
router.get("/create", enforce_read, async (req, res) => res.render("users/create.ejs"));

// View -- Edit
router.get("/:id", enforce_read, async (req, res) => {
  const user = await User.find_by_id(req.params.id);
  return res.render("users/edit.ejs", { user: user });
});

// View -- User Permissions
router.get("/:id/permissions", enforce_read, async (req, res) => {
  const user = await User.find_by_id(req.params.id);
  const permissions = await User.get_permissions();
  const user_permissions = await user?.get_permissions();
  return res.render("users/permissions.ejs", {
    user: user,
    permissions: permissions,
    user_permissions: user_permissions
  });
});

// Action -- Update User Permissions
router.put("/:id/permissions", enforce_write, async (req, res) => {
  const user = await User.find_by_id(req.params.id);
  const permissions = await User.get_permissions();
  const user_permissions = (await user?.get_permissions())?.map(el => el.code);
  const to_add: string[] = [];
  const to_remove: string[] = [];
  for (const permission of permissions) {
    const is_checked = req.body[permission.code] ? true : false;
    const is_granted = user_permissions?.includes(permission.code);
    if (is_checked && !is_granted) to_add.push(permission.code);
    else if (!is_checked && is_granted) to_remove.push(permission.code);
  }
  for (const code of to_add) await user?.grant_permission(code);
  for (const code of to_remove) await user?.revoke_permission(code);
  res.setHeader("HX-Redirect", "/users");
  return res.sendStatus(200);
});

// Action -- Create
router.post("/", enforce_write, validate_create, async (req, res) => {
  try {
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

// Action -- Update
router.put("/:id", enforce_write, validate_update, async (req, res) => {
  const user = await User.find_by_id(req.params.id);
  await user?.update(req.body);
  res.setHeader("HX-Redirect", "/users");
  return res.sendStatus(200);
});

// Action -- Delete
router.delete("/:id", enforce_write, async (req, res) => {
  const user = await User.find_by_id(req.params.id);
  await user?.delete();
  res.setHeader("HX-Redirect", "/users");
  return res.sendStatus(200);
});

export const user_router = router;
