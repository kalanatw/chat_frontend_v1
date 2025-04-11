import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

const LoadingDots = () => (
  <div className="chat-message bot">
    <div className="bubble loading">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </div>
  </div>
);

const ChatWindow = ({ messages, isLoading }) => {
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  return (
    <div className="chat-window" ref={chatWindowRef}>
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          text={message.text}
          type={message.sender}
        />
      ))}
      {isLoading && <LoadingDots />}
    </div>
  );
};

export default ChatWindow;
