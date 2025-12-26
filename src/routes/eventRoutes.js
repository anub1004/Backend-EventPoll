import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { authMiddleware } from '../middleware/authmiddleware.js';

const router = express.Router();

// Event routes
router.get('/:id', authMiddleware, eventController.getEventController);
router.get('/', authMiddleware, eventController.getUserEventsController);
router.post('/add', authMiddleware, eventController.createEventController);
router.put('/:id', authMiddleware, eventController.updateEventController);
router.delete('/:id', authMiddleware, eventController.deleteEventController);

// Invite
router.post('/:id/invite', authMiddleware, eventController.inviteUserController);
router.post('/:id/respond', authMiddleware, eventController.respondToInvitationController);

// Poll voting
router.post('/:pollId/vote', authMiddleware, eventController.votePollController);

export default router;
