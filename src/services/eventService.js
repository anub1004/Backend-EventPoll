import Event from '../models/Event.js';
import Poll from '../models/Poll.js';
import User from '../models/User.js';

// Create Event
export const createEvent = async (data, userId) => {
  const event = new Event({ ...data, creator: userId });
  return await event.save();
};

// Get single event by ID
export const getEventById = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate('creator', 'name email')
    .populate('participants.user', 'name email')
    .populate('poll');

  if (!event) throw { status: 404, message: 'Event not found' };
  return event;
};

// Get all events for a user
export const getUserEvents = async (userId) => {
  const events = await Event.find({ creator: userId })
    .populate('creator', 'name email')
    .populate('participants.user', 'name email')
    .populate('poll')
    .sort({ createdAt: -1 });
  return events;
};

// Update Event
export const updateEvent = async (eventId, data, userId) => {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, creator: userId },
    data,
    { new: true }
  );
  if (!event) throw { status: 404, message: 'Event not found or not authorized' };
  return event;
};

// Delete Event
export const deleteEvent = async (eventId, userId) => {
  const event = await Event.findOneAndDelete({ _id: eventId, creator: userId });
  if (!event) throw { status: 404, message: 'Event not found or not authorized' };
  return { message: 'Event deleted successfully' };
};

// Invite User
export const inviteUser = async (eventId, email, creatorId) => {
  const user = await User.findOne({ email });
  if (!user) throw { status: 404, message: 'User not found' };

  const event = await Event.findById(eventId);
  if (!event) throw { status: 404, message: 'Event not found' };
  if (event.creator.toString() !== creatorId) throw { status: 403, message: 'Not authorized' };

  // Check if already invited
  if (event.participants.some(p => p.user.toString() === user._id.toString()))
    throw { status: 400, message: 'User already invited' };

  event.participants.push({ user: user._id });
  await event.save();

  return { message: `Invitation sent to ${user.email}` };
};

// Respond to Invitation
export const respondToInvitation = async (eventId, userId, response) => {
  const event = await Event.findById(eventId);
  if (!event) throw { status: 404, message: 'Event not found' };

  const participant = event.participants.find(p => p.user.toString() === userId);
  if (!participant) throw { status: 403, message: 'Not invited to this event' };

  participant.status = response; // 'accepted' or 'rejected'
  await event.save();

  return { message: `You have ${response} the invitation` };
};

// Poll Voting
export const votePoll = async (pollId, optionIndex, userId) => {
  const poll = await Poll.findById(pollId);
  if (!poll) throw { status: 404, message: 'Poll not found' };

  // Remove vote if already voted
  poll.options.forEach(opt => {
    opt.votes = opt.votes.filter(v => v.toString() !== userId);
  });

  poll.options[optionIndex].votes.push(userId);
  await poll.save();

  return poll;
};
