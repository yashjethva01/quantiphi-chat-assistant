import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import { createChatStream } from '../services/aiService.js';

const validTones = new Set(['professional', 'casual', 'concise']);

function assertConversationId(id) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error('Invalid conversation id.');
    error.status = 400;
    throw error;
  }
}

function sendEvent(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function prepareStream(res) {
  res.status(200).set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.flushHeaders();
}

async function streamAssistantResponse({ res, conversation, messages, tone, replaceMessageId }) {
  prepareStream(res);
  const controller = new AbortController();
  let disconnected = false;
  let content = '';

  res.on('close', () => {
    disconnected = true;
    controller.abort();
  });

  try {
    const stream = await createChatStream(messages, tone, controller.signal);
    for await (const chunk of stream) {
      if (disconnected) return;
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        content += text;
        sendEvent(res, 'token', { text });
      }
    }

    if (!content.trim()) {
      throw new Error('The AI returned an empty response.');
    }

    if (replaceMessageId) {
      const target = conversation.messages.id(replaceMessageId);
      if (!target || target.role !== 'assistant') {
        const error = new Error('Assistant message to regenerate was not found.');
        error.status = 400;
        throw error;
      }
      target.content = content;
      target.timestamp = new Date();
    } else {
      conversation.messages.push({ role: 'assistant', content });
    }
    await conversation.save();
    sendEvent(res, 'complete', { conversation });
    res.end();
  } catch (error) {
    if (disconnected || error.name === 'AbortError') return;
    sendEvent(res, 'error', { message: error.message || 'AI generation failed.' });
    res.end();
  }
}

export async function listConversations(req, res) {
  const conversations = await Conversation.find()
    .select('title tone createdAt updatedAt messages')
    .sort({ updatedAt: -1 })
    .lean();
  res.json(
    conversations.map((conversation) => ({
      ...conversation,
      messageCount: conversation.messages.length,
      messages: undefined
    }))
  );
}

export async function searchConversations(req, res) {
  const query = String(req.query.q || '').trim();
  if (!query) return listConversations(req, res);
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const conversations = await Conversation.find({
    $or: [{ title: { $regex: escaped, $options: 'i' } }, { 'messages.content': { $regex: escaped, $options: 'i' } }]
  })
    .select('title tone createdAt updatedAt messages')
    .sort({ updatedAt: -1 })
    .lean();
  res.json(
    conversations.map((conversation) => ({
      ...conversation,
      messageCount: conversation.messages.length,
      messages: undefined
    }))
  );
}

export async function getConversation(req, res) {
  assertConversationId(req.params.id);
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });
  res.json(conversation);
}

export async function deleteConversation(req, res) {
  assertConversationId(req.params.id);
  const result = await Conversation.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ message: 'Conversation not found.' });
  res.status(204).end();
}

export async function updateTone(req, res) {
  assertConversationId(req.params.id);
  const { tone } = req.body;
  if (!validTones.has(tone)) return res.status(400).json({ message: 'Invalid tone.' });
  const conversation = await Conversation.findByIdAndUpdate(req.params.id, { tone }, { new: true });
  if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });
  res.json(conversation);
}

async function handleChat(req, res, replaceMessageId) {
  const { conversationId, message, tone = 'professional' } = req.body;
  if (message !== undefined && (typeof message !== 'string' || !message.trim() || message.length > 10000)) {
    return res.status(400).json({ message: 'Message must be a non-empty string under 10,000 characters.' });
  }
  if (!validTones.has(tone)) return res.status(400).json({ message: 'Invalid tone.' });
  if (conversationId) assertConversationId(conversationId);

  let conversation = conversationId ? await Conversation.findById(conversationId) : null;
  if (conversationId && !conversation) return res.status(404).json({ message: 'Conversation not found.' });
  if (!conversation) conversation = new Conversation({ tone });
  conversation.tone = tone;

  let promptMessages;
  if (replaceMessageId) {
    const target = conversation.messages.id(replaceMessageId);
    if (!target || target.role !== 'assistant') return res.status(400).json({ message: 'Invalid assistant message.' });
    const targetIndex = conversation.messages.indexOf(target);
    const userMessage = conversation.messages[targetIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return res.status(400).json({ message: 'No matching user message.' });
    promptMessages = conversation.messages.slice(0, targetIndex).map(({ role, content }) => ({ role, content }));
  } else {
    conversation.messages.push({ role: 'user', content: message.trim() });
    if (conversation.title === 'New conversation') conversation.title = message.trim().slice(0, 60);
    promptMessages = conversation.messages.map(({ role, content }) => ({ role, content }));
  }

  await conversation.save();
  return streamAssistantResponse({ res, conversation, messages: promptMessages, tone, replaceMessageId });
}

export function createChat(req, res) {
  return handleChat(req, res);
}

export function regenerateChat(req, res) {
  const { conversationId, messageId, tone } = req.body;
  if (!conversationId || !messageId) return res.status(400).json({ message: 'conversationId and messageId are required.' });
  return handleChat({ ...req, body: { conversationId, tone }, params: req.params }, res, messageId);
}

