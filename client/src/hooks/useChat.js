import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteConversation,
  getConversation,
  getConversations,
  streamChat,
  updateTone
} from '../services/chatService';

export function useChat() {
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [tone, setTone] = useState('professional');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const activeRequest = useRef(false);

  const refresh = useCallback(async (query = '') => {
    setConversations(await getConversations(query));
  }, []);

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, [refresh]);

  const selectConversation = useCallback(async (id) => {
    setError('');
    const next = await getConversation(id);
    setConversation(next);
    setTone(next.tone);
  }, []);

  const createNewConversation = useCallback(() => {
    setConversation(null);
    setTone('professional');
    setError('');
  }, []);

  const changeTone = useCallback(async (nextTone) => {
    setTone(nextTone);
    if (conversation?._id) {
      const next = await updateTone(conversation._id, nextTone);
      setConversation(next);
      await refresh();
    }
  }, [conversation, refresh]);

  const sendMessage = useCallback(async (message, messageId) => {
    if (activeRequest.current || (!messageId && !message.trim())) return;
    activeRequest.current = true;
    setIsStreaming(true);
    setError('');
    const temporaryId = `stream-${Date.now()}`;
    setConversation((current) => ({
      ...(current || { _id: undefined, title: message.slice(0, 60), messages: [] }),
      tone,
      messages: messageId
        ? (current?.messages || []).map((item) =>
            item._id === messageId ? { ...item, content: '', timestamp: new Date().toISOString() } : item
          )
        : [...(current?.messages || []), { _id: temporaryId, role: 'user', content: message, timestamp: new Date().toISOString() }, { _id: temporaryId, role: 'assistant', content: '', timestamp: new Date().toISOString() }]
    }));
    try {
      await streamChat({
        conversationId: conversation?._id,
        message: messageId ? undefined : message,
        tone,
        messageId,
        onToken: (text) => setConversation((current) => ({
          ...current,
          messages: current.messages.map((item) =>
            item.role === 'assistant' && (messageId ? item._id === messageId : item._id === temporaryId)
              ? { ...item, content: item.content + text }
              : item
          )
        })),
        onComplete: (next) => {
          setConversation(next);
          setTone(next.tone);
          refresh();
        },
        onError: setError
      });
    } catch (err) {
      setError(err.message);
    } finally {
      activeRequest.current = false;
      setIsStreaming(false);
    }
  }, [conversation, refresh, tone]);

  const removeConversation = useCallback(async (id) => {
    await deleteConversation(id);
    if (conversation?._id === id) createNewConversation();
    await refresh();
  }, [conversation, createNewConversation, refresh]);

  return {
    conversations,
    conversation,
    tone,
    isStreaming,
    error,
    refresh,
    selectConversation,
    createNewConversation,
    changeTone,
    sendMessage,
    removeConversation
  };
}

