import { Router } from 'express';
import * as pollController from '../controllers/pollController.js';
import { protect } from '../middleware/auth.js';


const router = Router();

// Use the renamed controller functions
router.post('/:pollId/vote', protect, pollController.voteController);
router.get('/:pollId/results', protect, pollController.getResultsController);

export default router;
