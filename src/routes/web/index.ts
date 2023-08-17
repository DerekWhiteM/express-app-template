import { check_authenticated, check_not_authenticated } from "../../utils/auth";
import { send_email } from "../../utils/utils";
import { User } from "../../models";
import { user_router } from "./users";
import { z, ZodIssue } from "zod";
import bcrypt from "bcrypt";
import express from "express";
import isStrongPassword from "validator/lib/isStrongPassword";
import passport from "passport";


// **Input validation**

async function validate_change-password(req: any, res: any, next: Function) {
  const schema = z.object({
    password: z
      .string()
      .max(50)
      .refine((val) => isStrongPassword(val), {
        message: "Weak password",
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
  if (schema_validation.success) return next();
  schema_validation.error.issues.forEach(
    (issue: ZodIssue) => (fields[issue.path[0]].error = issue.message)
  );
  return res.render("_partials/change-password.ejs", { fields: fields });
}

async function validate_reset_password(req: any, res: any, next: Function) {
  const schema = z.object({
    password: z
      .string()
      .max(50)
      .refine((val) => isStrongPassword(val), {
        message: "Weak password",
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
  if (schema_validation.success) return next();
  schema_validation.error.issues.forEach(
    (issue: ZodIssue) => (fields[issue.path[0]].error = issue.message)
  );
  return res.render("_partials/reset-password.ejs", { fields: fields, token: req.params.token });
}


// **Routes**

const router = express.Router();

router.use("/users", check_authenticated, user_router);

// View -- Home
router.get("/", check_authenticated, (req, res) => res.render("index.ejs"));

// View -- Login
router.get("/login", (req: any, res) => {
  if (req.session?.passport?.user) return res.render("index.ejs");
  return res.render("login.ejs");
});

// View -- Forgot Password
router.get("/forgot-password", check_not_authenticated, async (req, res) =>
  res.render("forgot-password.ejs")
);

// View -- Change Password
router.get("/change-password", check_authenticated, async (req, res) =>
  res.render("change-password.ejs")
);

// View -- Reset Password
router.get(
  "/reset-password/:token",
  check_not_authenticated,
  async (req, res) => {
    res.render("reset-password.ejs", { token: req.params.token });
  }
);

// Action -- Login
router.post("/login", check_not_authenticated, (req, res) => {
  passport.authenticate("local", (error: any, user: User, info: any) => {
    if (error) return res.sendStatus(500);
    if (!user) {
      return res.render("_partials/login.ejs", { fields: { ...info } });
    }
    req.logIn(user, (error) => {
      if (error) return res.sendStatus(500);
      res.setHeader("HX-Redirect", "/");
      res.sendStatus(200);
    });
  })(req, res);
});

// Action -- Logout
router.delete("/logout", check_authenticated, (req: any, res) => {
  try {
    req.logOut(() => {
      req.session.destroy();
      res.setHeader("HX-Redirect", "/login");
      res.sendStatus(200);
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Action -- Change Password
router.post(
  "/change-password",
  validate_change-password,
  async (req: any, res) => {
    const user_id = req.session.passport.user;
    const { password } = req.body;
    const user = await User.find_by_id(user_id);
    const new_hashed_password = await bcrypt.hash(password, 10);
    await user?.change-password(new_hashed_password);
    res.send("Success!");
  }
);

// Action -- Forgot Password
router.post("/forgot-password", async (req: any, res) => {
  const user = await (async function () {
    const by_username = await User.find_by_username(req.body.username);
    const by_email = await User.find_by_email(req.body.username);
    if (by_username) return by_username;
    else if (by_email) return by_email;
    else return null;
  })();
  if (!user) {
    return res.render("_partials/forgot-password", {
      fields: {
        username: {
          value: req.body.username,
          error: "No user found",
        },
      },
    });
  }
  const token = await user.generate_reset_token();
  const email_content = `<p>Click this <a href="${process.env.HOST_URL}/reset-password/${token}">link</a> to reset your password.</p>`;
  send_email([user.email], "Reset your password", email_content);
  return res.send(`Email sent to ${user.email}`);
});

// Action -- Reset Password
router.post("/reset-password/:token", validate_reset_password, async (req, res) => {
  const token = await User.find_reset_token(req.params.token);
  if (!token) return res.send("Invalid reset token");
  const hashed_password = await bcrypt.hash(req.body.password, 10);
  const user = await User.find_by_id(token.user_id);
  await user?.change-password(hashed_password);
  await User.delete_reset_token(token.id);
  return res.send("Password reset successful");
});

export const web_router = router;
