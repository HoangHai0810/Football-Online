import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import '../styles/AiAssistant.css';

const AI_API_URL = import.meta.env.VITE_CHATBOT_URL || 'http://localhost:8000/api/ai/chat';

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello Manager! How can I assist you with your squad or tournaments today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(AI_API_URL, 
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [...prev, { role: 'ai', content: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection lost. Please ensure the AI service is running and try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="ai-chat-window"
          >
            <div className="ai-chat-header">
              <div className="ai-header-info">
                <div className="ai-status-pulse">
                  <div className="ai-status-dot"></div>
                  <div className="ai-status-ring"></div>
                </div>
                <Bot size={22} className="text-emerald-400" />
                <h3>Football Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="ai-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="ai-messages-list">
              {messages.map((msg, i) => (
                <div key={i} className={`ai-message-wrapper ${msg.role}`}>
                  <div className="ai-avatar">
                   {msg.role === 'ai' ? <Sparkles size={18} /> : <User size={18} />}
                  </div>
                  <div className="ai-message-content">
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="ai-message-wrapper ai">
                  <div className="ai-avatar">
                    <Bot size={18} />
                  </div>
                  <div className="ai-message-content">
                    <div className="ai-typing-indicator">
                      <div className="ai-typing-dot"></div>
                      <div className="ai-typing-dot"></div>
                      <div className="ai-typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="ai-chat-input-area">
              <div className="ai-input-wrapper">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your manager hub..."
                  autoFocus
                />
              </div>
              <button type="submit" disabled={isLoading} className="ai-send-btn">
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`ai-toggle-btn ${isOpen ? 'active' : ''}`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && <div className="ai-notification-badge" />}
      </motion.button>
    </div>
  );
};

export default AiAssistant;
