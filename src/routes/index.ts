import { web_router } from "./web";
import express from "express";

const router = express.Router();
router.use("/", web_router);

export default router;
