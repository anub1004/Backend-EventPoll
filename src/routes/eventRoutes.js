import * as eventController from '../controllers/eventController.js';
import express from 'express';
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

// CREATE event
router.post('/add', authMiddleware, eventController.createEventController);

// GET all events for user (created + participating)
router.get('/', authMiddleware, eventController.getUserEventsController);

// GET single event by ID
router.get('/:id', authMiddleware, eventController.getEventByIdController);

// UPDATE event
router.put('/:id', authMiddleware, eventController.updateEventController);

// DELETE event
router.delete('/:id', authMiddleware, eventController.deleteEventController);

// INVITE user
router.post('/:id/invite', authMiddleware, eventController.inviteUserController);

// RESPOND to invitation
router.post('/:id/respond', authMiddleware, eventController.respondToInvitationController);

export default router;
