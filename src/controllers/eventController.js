import * as eventService from '../services/eventService.js';
import { check, validationResult } from 'express-validator';

export async function createEventController(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // ✅ call service function, not controller
    const event = await eventService.createEvent(req.body, req.user._id);

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getEventController(req, res) {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function getUserEventsController(req, res) {
  try {
    const events = await eventService.getUserEvents(req.user._id);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateEventController(req, res) {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body, req.user._id);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteEventController(req, res) {
  try {
    const result = await eventService.deleteEvent(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function inviteUserController(req, res) {
  try {
    const result = await eventService.inviteUser(req.params.id, req.body.email, req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function respondToInvitationController(req, res) {
  try {
    const result = await eventService.respondToInvitation(req.params.id, req.user._id, req.body.response);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}



// controllers/eventController.js
import Event from '../models/Event.js';



export const getEventByIdController = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    res.status(200).json({ status: 'success', data: event });
  } catch (err) {
    res.status(err.status || 500).json({ status: 'error', message: err.message });
  }
};


// Other controllers remain the same (createEventController, updateEventController, etc.)
export const getEventById = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate('creator', 'name email')
    .populate('participants.user', 'name email')
    .populate('poll');

  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }

  // Optional: Ensure poll always has options
  if (event.poll) {
    event.poll.options = event.poll.options || [];
  }

  return event;
};
