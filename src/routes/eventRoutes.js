import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { authMiddleware } from '../middleware/authmiddleware.js';

const router = express.Router();

// IMPORTANT: /:id must come BEFORE / to avoid conflict
router.get('/:id', authMiddleware, eventController.getEventByIdController);
router.get('/', authMiddleware, eventController.getUserEventsController);

router.post('/add', authMiddleware, eventController.createEventController);
router.put('/:id', authMiddleware, eventController.updateEventController);
router.delete('/:id', authMiddleware, eventController.deleteEventController);
router.post('/:id/invite', authMiddleware, eventController.inviteUserController);
router.post('/:id/respond', authMiddleware, eventController.respondToInvitationController);

export default router;
