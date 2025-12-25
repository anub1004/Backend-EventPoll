import { Schema, model } from 'mongoose';

const eventSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOptions: [{
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    }
  }],
  participants: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  poll: {
    type: Schema.Types.ObjectId,
    ref: 'Poll'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

eventSchema.index({ creator: 1 });
eventSchema.index({ 'participants.user': 1 });

export default model('Event', eventSchema);