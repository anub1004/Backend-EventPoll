import * as pollService from '../services/pollService.js';
import { check, validationResult } from 'express-validator';

export async function voteController(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // ✅ Call service function, not controller
    const poll = await pollService.vote(
      req.params.pollId,
      req.body.optionIndex,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: poll
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

export async function getResultsController(req, res) {
  try {
    const results = await pollService.getPollResults(req.params.pollId);

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
}
