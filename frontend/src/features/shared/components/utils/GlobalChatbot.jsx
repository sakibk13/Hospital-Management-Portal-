import React from 'react';
import { useChat } from '../../../../contexts/ChatContext';
import Chatbot from './Chatbot';
import { FaRobot, FaTimes } from 'react-icons/fa';
import '../../../../components/styles/Chatbot.css';

const GlobalChatbot = () => {
  const { isOpen, setIsOpen, toggleChat } = useChat();

  return (
    <>
      {/* Floating AI Health Assistant Trigger - Visible on all pages */}
      <div
        className="chatbot-icon-wrap"
        onClick={toggleChat}
        title="HealingWave AI Health Assistant"
        aria-label="Toggle AI Assistant"
      >
        {!isOpen && <span className="chat-radar"></span>}
        <div className="chatbot-icon">
          {isOpen ? <FaTimes size={20} /> : <FaRobot size={24} />}
        </div>
        {!isOpen && (
          <span className="chat-tooltip">Need Help? Chat with AI Assistant</span>
        )}
      </div>

      {/* Chatbox Window - Persists across all page navigations */}
      {isOpen && <Chatbot onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default GlobalChatbot;
