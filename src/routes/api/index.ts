import { user_router } from "./users";
import express from "express";

const router = express.Router();

router.use("/users", user_router);

export default router;
