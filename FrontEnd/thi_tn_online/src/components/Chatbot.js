import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaCog, FaLightbulb, FaQuestionCircle, FaBook, FaChartLine, FaGraduationCap, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { chatbotService } from '../api/chatbot';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Xin chào! Tôi là trợ lý của hệ thống. Tôi có thể giúp gì cho bạn về việc học tập và làm bài thi?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  // Sound effects
  const playSound = (soundType) => {
    if (!soundEnabled) return;
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(soundType) {
      case 'send':
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'receive':
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
      case 'click':
        oscillator.frequency.value = 1000;
        gainNode.gain.value = 0.05;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
      default:
        break;
    }
  };

  // Quick replies for common questions
  const quickReplies = [
    { id: 1, text: 'Làm bài thi', icon: FaBook, action: 'Làm bài thi như thế nào?' },
    { id: 2, text: 'Xem điểm', icon: FaChartLine, action: 'Xem điểm thi của tôi' },
    { id: 3, text: 'Hướng dẫn', icon: FaLightbulb, action: 'Hướng dẫn sử dụng hệ thống' },
    { id: 4, text: 'Hỗ trợ', icon: FaQuestionCircle, action: 'Tôi cần giúp đỡ' },
    { id: 5, text: 'Lớp học', icon: FaGraduationCap, action: 'Quản lý lớp học' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    playSound('send'); // Play send sound

    const userMessage = {
      id: Date.now(),
      text: messageText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setShowQuickReplies(false); // Hide quick replies after first message
    setIsTyping(true);

    try {
      // Get user context for personalized responses
      const userContext = chatbotService.getUserContext();
      
      // Use rule-based responses only (context-aware)
      const response = chatbotService.getFallbackResponse(messageText);

      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      playSound('receive'); // Play receive sound
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ giáo viên.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      playSound('receive'); // Play receive sound for error too
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply) => {
    playSound('click'); // Play click sound
    handleSendMessage(reply.action);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: 'Xin chào! Tôi là trợ lý của hệ thống. Tôi có thể giúp gì cho bạn?',
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    setShowQuickReplies(true); // Show quick replies again
  };

  if (!isOpen) {
    return (
      <div className="chatbot-toggle" onClick={() => setIsOpen(true)}>
        <FaRobot />
        <span>Hỗ trợ</span>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <FaRobot />
          <span>Trợ lý Hỗ Trợ</span>
        </div>
        <div className="chatbot-controls">
          <button 
            className="control-button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </button>
          <button 
            className="control-button"
            onClick={clearChat}
            title="Xóa lịch sử trò chuyện"
          >
            🗑️
          </button>
          <button 
            className="chatbot-close"
            onClick={() => setIsOpen(false)}
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              <div className="message-avatar">
                {message.sender === 'user' ? <FaUser /> : <FaRobot />}
              </div>
              <div className="message-text">
                {message.text}
              </div>
            </div>
            <div className="message-time">
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}
        
        {/* Quick Replies */}
        {showQuickReplies && messages.length === 1 && (
          <div className="quick-replies">
            <div className="quick-replies-title">Bạn cần giúp gì?</div>
            <div className="quick-replies-grid">
              {quickReplies.map((reply) => (
                <button
                  key={reply.id}
                  className="quick-reply-button"
                  onClick={() => handleQuickReply(reply)}
                >
                  <reply.icon className="quick-reply-icon" />
                  <span>{reply.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {isTyping && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="message-avatar">
                <FaRobot />
              </div>
              <div className="typing-indicator-enhanced">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input">
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            disabled={isTyping}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="send-button"
          >
            <FaPaperPlane />
          </button>
        </div>
        <div className="chatbot-footer">
          <span className="mode-indicator">
            🤖 Trợ lý thông minh
          </span>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
