import { check_authenticated } from "../../auth";
import { user_router } from "./users";
import express from "express";

const router = express.Router();

router.use("/users", check_authenticated, user_router);

export const api_router = router;
