import { Schema, model } from 'mongoose';

const pollSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  question: {
    type: String,
    required: [true, 'Please provide a poll question'],
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    votes: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

pollSchema.index({ event: 1 });

export default model('Poll', pollSchema);


