import Event from '../models/Event.js';
import Poll from '../models/Poll.js';
import User from '../models/User.js';

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
    .populate('poll');
};

export const getEventById = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate('creator', 'name email')
    .populate('participants.user', 'name email')
    .populate('poll');

  if (!event) {
    throw new Error('Event not found');
  }

  return event;
};

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

export const updateEvent = async (eventId, updateData, userId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error('Event not found');
  }

  if (event.creator.toString() !== userId) {
    throw new Error('Not authorized to update this event');
  }

  Object.assign(event, updateData);
  await event.save();

  return await Event.findById(eventId)
    .populate('creator', 'name email')
    .populate('poll');
};

export const deleteEvent = async (eventId, userId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error('Event not found');
  }

  if (event.creator.toString() !== userId) {
    throw new Error('Not authorized to delete this event');
  }

  await Poll.findByIdAndDelete(event.poll);
  await Event.findByIdAndDelete(eventId);

  return { message: 'Event deleted successfully' };
};

export const inviteUser = async (eventId, inviteeEmail, inviterId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error('Event not found');
  }

  if (event.creator.toString() !== inviterId) {
    throw new Error('Only event creator can invite users');
  }

  const invitee = await User.findOne({ email: inviteeEmail });

  if (!invitee) {
    throw new Error('User not found');
  }

  const alreadyParticipant = event.participants.some(
    p => p.user.toString() === invitee._id.toString()
  );

  if (alreadyParticipant) {
    throw new Error('User is already a participant');
  }

  const alreadyInvited = invitee.invitations.some(
    inv => inv.event.toString() === eventId && inv.status === 'pending'
  );

  if (alreadyInvited) {
    throw new Error('User already has a pending invitation');
  }

  invitee.invitations.push({
    event: eventId,
    status: 'pending'
  });

  await invitee.save();

  return { message: 'Invitation sent successfully' };
};

export const respondToInvitation = async (eventId, userId, response) => {
  const user = await User.findById(userId);

  const invitation = user.invitations.find(
    inv => inv.event.toString() === eventId
  );

  if (!invitation) {
    throw new Error('Invitation not found');
  }

  invitation.status = response;

  if (response === 'accepted') {
    const event = await Event.findById(eventId);
    event.participants.push({ user: userId });
    await event.save();
  }

  await user.save();

  return { message: `Invitation ${response}` };
};
