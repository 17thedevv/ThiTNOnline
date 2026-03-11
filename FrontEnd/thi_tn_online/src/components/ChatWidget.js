import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaCog, FaTrash, FaComments } from "react-icons/fa";
import { chatbotService } from "../api/chatbot";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !currentConversation) {
      loadConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const data = await chatbotService.getConversations();
      setConversations(data);
      if (data.length > 0) {
        loadConversation(data[0].id);
      } else {
        createNewConversation();
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const createNewConversation = async () => {
    try {
      const conversation = await chatbotService.createConversation();
      setConversations(prev => [conversation, ...prev]);
      setCurrentConversation(conversation);
      setMessages([]);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const conversation = await chatbotService.getConversation(conversationId);
      setCurrentConversation(conversation);
      const messages = await chatbotService.getMessages(conversationId);
      setMessages(messages);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await chatbotService.sendMessage(
        currentConversation.id,
        inputMessage
      );
      
      const botMessage = {
        id: response.id,
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        response_type: response.response_type,
        confidence_score: response.confidence_score
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
        sender: 'bot',
        timestamp: new Date(),
        response_type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowSettings(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSenderIcon = (sender) => {
    switch (sender) {
      case 'user':
        return <FaUser className="message-icon user-icon" />;
      case 'bot':
        return <FaRobot className="message-icon bot-icon" />;
      default:
        return null;
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Chào bạn';
    
    if (hour < 12) greeting = 'Chào buổi sáng';
    else if (hour < 18) greeting = 'Chào buổi chiều';
    else greeting = 'Chào buổi tối';

    return {
      id: 'welcome',
      text: `${greeting}! Tôi là trợ lý ảo của ThiTNOnline. Tôi có thể giúp bạn:\n\n📚 Tìm hiểu về các môn học\n📝 Hướng dẫn làm bài thi\n📊 Xem kết quả và thống kê\n🔔 Quản lý thông báo\n\nBạn cần giúp gì hôm nay?`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'welcome'
    };
  };

  const getMessageClass = (message) => {
    if (message.response_type === 'ai_generated') return 'message-ai';
    if (message.response_type === 'error') return 'message-error';
    if (message.type === 'welcome') return 'message-welcome';
    return '';
  };

  if (!isOpen) {
    return (
      <div className="chat-widget-closed">
        <button 
          className="chat-button"
          onClick={() => setIsOpen(true)}
          title="Bắt đầu trò chuyện"
        >
          <FaRobot className="chat-icon" />
          <span className="chat-badge">Hỗ trợ</span>
          <div className="chat-button-pulse"></div>
        </button>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="chat-widget-minimized">
        <button 
          className="chat-minimized-button"
          onClick={() => setIsMinimized(false)}
          title="Mở lại trò chuyện"
        >
          <FaComments className="chat-minimized-icon" />
          <span className="chat-minimized-text">Hỗ trợ</span>
        </button>
      </div>
    );
  }

  return (
    <div className="chat-widget-open">
      <div className="chat-header">
        <div className="chat-header-info">
          <FaRobot className="chat-header-icon" />
          <div className="chat-header-text">
            <h3>Trợ lý ảo ThiTNOnline</h3>
            <span className="chat-status online">Đang hoạt động</span>
          </div>
        </div>
        <div className="chat-header-actions">
          <button 
            className="header-action-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Cài đặt"
          >
            <FaCog />
          </button>
          <button 
            className="header-action-btn"
            onClick={() => setIsMinimized(true)}
            title="Thu nhỏ"
          >
            −
          </button>
          <button 
            className="header-action-btn"
            onClick={() => setIsOpen(false)}
            title="Đóng"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="chat-settings">
          <h4>Cài đặt</h4>
          <button className="settings-btn" onClick={clearChat}>
            <FaTrash /> Xóa lịch sử trò chuyện
          </button>
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="message bot-message message-welcome">
            {getSenderIcon('bot')}
            <div className="message-content">
              <div className="message-text">
                {getWelcomeMessage().text.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              <span className="message-time">{formatTime(new Date())}</span>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.sender}-message ${getMessageClass(message)}`}
          >
            {getSenderIcon(message.sender)}
            <div className="message-content">
              <div className="message-text">
                {message.text.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              <span className="message-time">{formatTime(message.timestamp)}</span>
              {message.response_type && (
                <span className="message-type">{message.response_type}</span>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot-message typing">
            <FaRobot className="message-icon bot-icon" />
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn của bạn..."
            className="message-input"
            rows={1}
            disabled={isLoading}
            ref={inputRef}
          />
          <button 
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            title="Gửi tin nhắn"
          >
            <FaPaperPlane />
          </button>
        </div>
        <div className="input-suggestions">
          <span className="suggestion-hint">Gợi ý: </span>
          <button 
            className="suggestion-btn"
            onClick={() => setInputMessage('Tôi cần giúp đỡ làm bài thi')}
          >
            Làm bài thi
          </button>
          <button 
            className="suggestion-btn"
            onClick={() => setInputMessage('Xem kết quả của tôi')}
          >
            Xem kết quả
          </button>
          <button 
            className="suggestion-btn"
            onClick={() => setInputMessage('Các môn học có sẵn')}
          >
            Môn học
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
