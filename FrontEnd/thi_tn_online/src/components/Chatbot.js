import { useState } from "react";
import "./Chatbot.css";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Xin chào 👋 Tôi có thể giúp gì cho bạn?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { text: input, sender: "user" },
      { text: "Tôi đang được phát triển thêm 🤖", sender: "bot" }
    ];

    setMessages(newMessages);
    setInput("");
  };

  return (
    <div className="chatbot-container">
      {open && (
        <div className="chatbox">
          <div className="chatbox-header">
            <span>Chat hỗ trợ 🤖</span>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          <div className="chatbox-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chatbox-input">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Gửi</button>
          </div>
        </div>
      )}

      <button className="chat-toggle" onClick={() => setOpen(!open)}>
        💬
      </button>
    </div>
  );
};

export default ChatBot;