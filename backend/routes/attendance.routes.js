import express from "express";
import { markAttendance, approveAttendance,getEmployerAttendance  } from "../controllers/attendance.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/mark", protect, markAttendance);
router.patch("/approve/:id", protect, approveAttendance);
router.get("/", protect, getEmployerAttendance);
export default router;