import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/employers", protect, async (req, res) => {
  try {
    const employers = await User.find({ role: "employer" }).select("name phone");
    res.json(employers);
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching employers: " + err.message });
  }
});

export default router;