import { validationResult } from "express-validator";
import { registerUser, loginUser, getUserProfile } from "../services/authService.js";

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: errors.array()[0].msg });
  }

  try {
    const user = await registerUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: errors.array()[0].msg });
  }

  try {
    const user = await loginUser(req.body.email, req.body.password);
    res.status(200).json({ success: true, data: user });
  } catch {
    res.status(401).json({ success: false, message: "Invalid email or password" });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await getUserProfile(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch {
    res.status(404).json({ success: false, message: "User not found" });
  }
};
