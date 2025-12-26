import Invite from "../models/Invite.js";
import Event from "../models/Event.js";

export const sendInvite = async (req, res) => {
  const invite = await Invite.create({
    event: req.body.eventId,
    sender: req.user.id,
    receiver: req.body.userId,
  });
  res.status(201).json(invite);
};

export const respondInvite = async (req, res) => {
  const invite = await Invite.findById(req.params.id);

  invite.status = req.body.status;
  await invite.save();

  if (req.body.status === "accepted") {
    await Event.findByIdAndUpdate(invite.event, {
      $addToSet: { participants: invite.receiver },
    });
  }

  res.json(invite);
};

export const getMyInvites = async (req, res) => {
  const invites = await Invite.find({ receiver: req.user.id })
    .populate("event");
  res.json(invites);
};
