import * as eventController from '../controllers/eventController.js';
import express from 'express';
import { authMiddleware } from "../middleware/authmiddleware.js";
const router = express.Router();

router.post('/add', authMiddleware, eventController.createEventController);
router.get('/', authMiddleware, eventController.getUserEventsController);
router.put('/:id', authMiddleware, eventController.updateEventController);
router.delete('/:id', authMiddleware, eventController.deleteEventController);
router.post('/:id/invite', authMiddleware, eventController.inviteUserController);
router.post('/:id/respond', authMiddleware, eventController.respondToInvitationController);

export default router;
