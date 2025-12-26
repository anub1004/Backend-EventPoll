import Event from '../models/Event.js';
import Poll from '../models/Poll.js';
import User from '../models/User.js';

/**
 * CREATE EVENT
 */
export const createEvent = async (eventData, creatorId) => {
  const { title, description, dateOptions, pollQuestion, pollOptions } = eventData;

  const event = await Event.create({
    title,
    description,
    creator: creatorId,
    dateOptions,
    participants: [{ user: creatorId }]
  });

  const poll = await Poll.create({
    event: event._id,
    question: pollQuestion,
    options: pollOptions.map(text => ({ text, votes: [] }))
  });

  event.poll = poll._id;
  await event.save();

  return await Event.findById(event._id)
    .populate('creator', 'name email')
    .populate('participants.user', 'name email')
    .populate('poll');
};
import Event from '../models/Event.js';

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

  return event;
};

/**
 * GET EVENT BY ID


/**
 * GET USER EVENTS (created + participating)
 */
export const getUserEvents = async (userId) => {
  const createdEvents = await Event.find({ creator: userId })
    .populate('poll')
    .sort('-createdAt');

  const participatingEvents = await Event.find({
    'participants.user': userId,
    creator: { $ne: userId }
  })
    .populate('creator', 'name email')
    .populate('poll')
    .sort('-createdAt');

  return { createdEvents, participatingEvents };
};

/**
 * UPDATE EVENT
 */
export const updateEvent = async (eventId, updateData, userId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }

  if (event.creator.toString() !== userId.toString()) {
    const err = new Error('Not authorized to update this event');
    err.status = 403;
    throw err;
  }

  Object.assign(event, updateData);
  await event.save();

  return await Event.findById(eventId)
    .populate('creator', 'name email')
    .populate('participants.user', 'name email')
    .populate('poll');
};

/**
 * DELETE EVENT
 */
export const deleteEvent = async (eventId, userId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }

  if (event.creator.toString() !== userId.toString()) {
    const err = new Error('Not authorized to delete this event');
    err.status = 403;
    throw err;
  }

  await Poll.findByIdAndDelete(event.poll);
  await Event.findByIdAndDelete(eventId);

  return { message: 'Event deleted successfully' };
};

/**
 * INVITE USER
 */
export const inviteUser = async (eventId, inviteeEmail, inviterId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }

  if (event.creator.toString() !== inviterId.toString()) {
    const err = new Error('Only event creator can invite users');
    err.status = 403;
    throw err;
  }

  const invitee = await User.findOne({ email: inviteeEmail });

  if (!invitee) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const alreadyParticipant = event.participants.some(
    p => p.user.toString() === invitee._id.toString()
  );

  if (alreadyParticipant) {
    const err = new Error('User is already a participant');
    err.status = 400;
    throw err;
  }

  const alreadyInvited = invitee.invitations.some(
    inv => inv.event.toString() === eventId && inv.status === 'pending'
  );

  if (alreadyInvited) {
    const err = new Error('User already has a pending invitation');
    err.status = 400;
    throw err;
  }

  invitee.invitations.push({
    event: eventId,
    status: 'pending'
  });

  await invitee.save();

  return { message: 'Invitation sent successfully' };
};

/**
 * RESPOND TO INVITATION
 */
export const respondToInvitation = async (eventId, userId, response) => {
  if (!['accepted', 'rejected'].includes(response)) {
    const err = new Error('Invalid invitation response');
    err.status = 400;
    throw err;
  }

  const user = await User.findById(userId);

  const invitation = user.invitations.find(
    inv => inv.event.toString() === eventId
  );

  if (!invitation) {
    const err = new Error('Invitation not found');
    err.status = 404;
    throw err;
  }

  invitation.status = response;

  if (response === 'accepted') {
    const event = await Event.findById(eventId);
    if (!event.participants.some(p => p.user.toString() === userId.toString())) {
      event.participants.push({ user: userId });
      await event.save();
    }
  }

  await user.save();

  return { message: `Invitation ${response}` };
};
import Event from '../models/Event.js';

