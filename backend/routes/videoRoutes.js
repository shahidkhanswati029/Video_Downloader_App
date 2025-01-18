import express from "express";
import { downloadVideo } from "../controllers/videoController.js";

const router = express.Router();

router.post("/download", downloadVideo);

export default router;
