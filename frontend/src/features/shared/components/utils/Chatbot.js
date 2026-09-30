import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../../../../components/styles/Chatbot.css';
import { FaPaperPlane, FaRobot, FaTimes, FaRedo, FaUser } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../../../contexts/ChatContext';

// Escape HTML then render a safe subset of markdown: links, bold, line breaks.
const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const renderMarkdown = (text) => {
  let html = escapeHtml(text);
  // [label](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) => {
    const safeUrl = url.trim();
    const internal = safeUrl.startsWith('/');
    return `<a href="${safeUrl}" data-internal="${internal}" class="chat-link"><span>${label}</span> <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="link-arrow"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>`;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\n/g, '<br/>');
  return html;
};

const QUICK_PROMPTS = [
  { label: '👨‍⚕️ Find Specialist', query: 'Can you help me find a doctor or specialist?' },
  { label: '📅 Book Appointment', query: 'How do I book an appointment?' },
  { label: '🩸 Blood Bank', query: 'Check emergency blood bank stock availability' },
  { label: '💊 Order Medicine', query: 'How can I buy medicines from the pharmacy?' },
  { label: '🚨 Emergency Hotline', query: 'What is the emergency helpline number?' },
];

const Chatbot = ({ onClose }) => {
  const navigate = useNavigate();
  const bodyRef = useRef(null);
  const { messages, setMessages } = useChat();
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, typing]);

  // Intercept clicks on internal links so they use the SPA router
  const handleBodyClick = (e) => {
    const a = e.target.closest('a.chat-link');
    if (a && a.getAttribute('data-internal') === 'true') {
      e.preventDefault();
      navigate(a.getAttribute('href'));
      if (onClose) onClose();
    }
  };

  const sendMessage = async (textToSend) => {
    const text = textToSend.trim();
    if (!text || typing) return;

    const userMessage = { sender: 'user', text };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setTyping(true);

    // Build conversation memory from previous messages (excluding initial greeting)
    const history = messages
      .slice(1)
      .slice(-10)
      .map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

    try {
      const response = await axios.post('/api/chatbot/chat', { message: text, history });
      const botMessage = { sender: 'bot', text: response.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'I am having trouble connecting to the hospital assistant right now. Please try again in a moment or call 10666 for emergency assistance.',
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([
      {
        sender: 'bot',
        text: 'Hello! I am your HealingWave AI assistant. Ask me about doctors, appointments, blood availability, medicines, or how to use the portal.',
      },
    ]);
  };

  return (
    <div className="chatbox">
      <Helmet>
        <title>AI Health Assistant — HealingWave</title>
      </Helmet>

      {/* Modern Medical Gradient Header */}
      <header className="chatbox-header">
        <div className="header-info">
          <div className="bot-icon-container">
            <div className="bot-icon-glow"></div>
            <FaRobot className="bot-icon" />
            <span className="online-beacon" title="Online and ready to help" />
          </div>
          <div className="header-text">
            <div className="header-title-row">
              <h3 className="chatbox-title">HealingWave AI</h3>
              <span className="header-badge">Assistant</span>
            </div>
            <span className="online-status">
              <span className="online-dot" /> Online • 24/7 Clinical Support
            </span>
          </div>
          <div className="header-actions">
            <button
              className="chatbox-action-btn"
              onClick={handleReset}
              title="Reset conversation"
              aria-label="Reset conversation"
              type="button"
            >
              <FaRedo size={12} />
            </button>
            {onClose && (
              <button
                className="chatbox-action-btn chatbox-close-btn"
                onClick={onClose}
                title="Close chat"
                aria-label="Close chat"
                type="button"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Messages Section */}
      <section className="chatbox-body" ref={bodyRef} onClick={handleBodyClick}>
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.sender}-wrapper`}>
            {msg.sender === 'bot' && (
              <div className="bot-avatar-mini" title="HealingWave AI">
                <FaRobot size={12} />
              </div>
            )}
            <div
              className={`message ${msg.sender}`}
              dangerouslySetInnerHTML={msg.sender === 'bot' ? { __html: renderMarkdown(msg.text) } : undefined}
            >
              {msg.sender === 'user' ? msg.text : undefined}
            </div>
            {msg.sender === 'user' && (
              <div className="user-avatar-mini" title="You">
                <FaUser size={10} />
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div className="message-wrapper bot-wrapper">
            <div className="bot-avatar-mini" title="HealingWave AI">
              <FaRobot size={12} />
            </div>
            <div className="message bot typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </section>

      {/* Quick Suggestion Chips */}
      <div className="chat-suggestions-container">
        <div className="chat-suggestions-track">
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              className="chat-chip"
              onClick={() => sendMessage(item.query)}
              disabled={typing}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer & Modern Input Area */}
      <footer className="chatbox-footer">
        <div className="chatbox-input-container">
          <input
            className="chatbox-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about doctors, appointments, pharmacy..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            className="chatbox-send-icon"
            onClick={handleSend}
            disabled={!input.trim() || typing}
            aria-label="Send message"
            type="button"
          >
            <FaPaperPlane size={14} />
          </button>
        </div>
        <div className="chatbox-disclaimer">
          AI guidance only. In emergency, call <a href="tel:10666">10666</a>
        </div>
      </footer>
    </div>
  );
};

export default Chatbot;
