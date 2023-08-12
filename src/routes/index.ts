import { api_router } from "./api";
import { web_router } from "./web";
import express from "express";

const router = express.Router();

router.use("/", web_router);

router.use("/api", api_router);

export default router;
