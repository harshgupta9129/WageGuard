import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, phone, role, password } = req.body;

    if (!name || !phone || !role || !password) {
      return res.status(400).json({ message: "All fields (name, phone, role, password) are required" });
    }

    if (role !== "worker" && role !== "employer") {
      return res.status(400).json({ message: "Role must be either 'worker' or 'employer'" });
    }

    // Check if phone already registered
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "A user is already registered with this phone number" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      role,
      password: hashed
    });

    // Don't send back password hash
    const userResponse = {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json(userResponse);
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error during registration. " + err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone number and password are required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found with this phone number" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials. Please check your password." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d"
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role
    };

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login. " + err.message });
  }
};