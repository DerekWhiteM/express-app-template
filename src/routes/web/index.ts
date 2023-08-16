import { check_authenticated, check_not_authenticated } from "../../utils/auth";
import { User } from "../../models";
import { user_router } from "./users";
import { z, ZodIssue } from "zod";
import bcrypt from "bcrypt";
import express from "express";
import isStrongPassword from "validator/lib/isStrongPassword";
import passport from "passport";

async function validate_change_password(req: any, res: any, next: Function) {
  const schema = z.object({
    current_password: z.string(),
    new_password: z.string().max(50).refine(val => isStrongPassword(val), {
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
    return next();
  } else {
    schema_validation.error.issues.forEach(
      (issue: ZodIssue) => (fields[issue.path[0]].error = issue.message)
    );
    return res.render("_partials/change_password.ejs", { fields: fields });
  }
}

const router = express.Router();

router.use("/users", check_authenticated, user_router);

router.get("/", check_authenticated, (req, res) => res.render("index.ejs"));

router.get("/login", (req: any, res) => {
  if (req.session?.passport?.user) return res.render("index.ejs");
  return res.render("login.ejs");
});

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

router.post("/login", check_not_authenticated, (req, res) => {
  passport.authenticate("local", (error: any, user: User, info: any) => {
    if (error) return res.sendStatus(500);
    if (!user) {
      return res.render("_partials/login.ejs", { fields: {...info} });
    }
    req.logIn(user, (error) => {
      if (error) return res.sendStatus(500);
      res.setHeader("HX-Redirect", "/");
      res.sendStatus(200);
    });
  })(req, res);
});

// View -- Change Password
router.get("/change-password", check_authenticated, async (req, res) => res.render("change_password.ejs"));

// Action -- Change password
router.post("/change-password", validate_change_password, async (req: any, res) => {
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
    res.send("Success!");
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

export const web_router = router;
