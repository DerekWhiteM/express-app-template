import { init_passport } from "./auth";
import compression from "compression";
import express from "express";
import passport from "passport";
import router from "./routes";
import session from "express-session";
import path from "path";

const app = express();

app.set("view-engine", "ejs");

init_passport();

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 8 * 3600000,
      sameSite: "lax",
      httpOnly: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(router);
app.use(express.static(path.join(__dirname, "/../public")));

app.listen(process.env.PORT, () => {
  console.log(`App running on http://localhost:${process.env.PORT}`);
});
