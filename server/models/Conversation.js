import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: true }
);

const conversationSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'New conversation', trim: true },
    tone: {
      type: String,
      enum: ['professional', 'casual', 'concise'],
      default: 'professional'
    },
    messages: { type: [messageSchema], default: [] }
  },
  { timestamps: true }
);

conversationSchema.index({ title: 'text', 'messages.content': 'text' });

export default mongoose.model('Conversation', conversationSchema);

