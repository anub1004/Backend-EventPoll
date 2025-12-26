import express from "express";
import { sendInvite, respondInvite, getMyInvites } from "../../controllers/inviteController.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.post("/", auth, sendInvite);
router.get("/", auth, getMyInvites);
router.put("/:id", auth, respondInvite);

export default router;
