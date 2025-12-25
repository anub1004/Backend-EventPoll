import Poll from '../models/Poll.js';
import Event from '../models/Event.js';

export const vote = async (pollId, optionIndex, userId) => {
  const poll = await Poll.findById(pollId);

  if (!poll) {
    throw new Error('Poll not found');
  }

  if (!poll.isActive) {
    throw new Error('Poll is not active');
  }

  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    throw new Error('Invalid option index');
  }

  const event = await Event.findById(poll.event);

  const isParticipant = event.participants.some(
    p => p.user.toString() === userId
  );

  if (!isParticipant) {
    throw new Error('You must be a participant to vote');
  }

  // If multiple votes not allowed, remove previous votes
  if (!poll.allowMultipleVotes) {
    poll.options.forEach(option => {
      option.votes = option.votes.filter(
        v => v.user.toString() !== userId
      );
    });
  }

  const alreadyVoted = poll.options[optionIndex].votes.some(
    v => v.user.toString() === userId
  );

  if (alreadyVoted) {
    throw new Error('You have already voted for this option');
  }

  poll.options[optionIndex].votes.push({ user: userId });
  await poll.save();

  return await Poll.findById(pollId)
    .populate('options.votes.user', 'name email');
};

export const getPollResults = async (pollId) => {
  const poll = await Poll.findById(pollId)
    .populate('options.votes.user', 'name email');

  if (!poll) {
    throw new Error('Poll not found');
  }

  const results = poll.options.map(option => ({
    text: option.text,
    voteCount: option.votes.length,
    voters: option.votes.map(v => ({
      name: v.user.name,
      email: v.user.email,
      votedAt: v.votedAt
    }))
  }));

  return {
    question: poll.question,
    totalVotes: results.reduce((sum, r) => sum + r.voteCount, 0),
    results
  };
};
