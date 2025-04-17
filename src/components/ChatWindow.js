import React, { useEffect, useRef, useState } from 'react';
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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // Scroll to bottom when messages change
    const scrollToBottom = () => {
      if (chatWindowRef.current) {
        const scrollHeight = chatWindowRef.current.scrollHeight;
        const targetScrollTop = scrollHeight - chatWindowRef.current.clientHeight;
        
        // Use smooth scrolling only for small scroll distances
        const currentScrollTop = chatWindowRef.current.scrollTop;
        const scrollDistance = Math.abs(targetScrollTop - currentScrollTop);
        
        chatWindowRef.current.scrollTo({
          top: targetScrollTop,
          behavior: scrollDistance < 1000 ? 'smooth' : 'auto'
        });
      }
    };

    scrollToBottom();

    // Handle iOS keyboard events
    const handleFocus = () => {
      setIsKeyboardVisible(true);
      // Wait for keyboard animation
      setTimeout(scrollToBottom, 100);
    };

    const handleBlur = () => {
      setIsKeyboardVisible(false);
    };

    // Handle orientation changes
    const handleResize = () => {
      // Prevent scroll issues during orientation change
      if (chatWindowRef.current) {
        chatWindowRef.current.style.height = '100%';
        setTimeout(scrollToBottom, 100);
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [messages, isLoading]);

  return (
    <div 
      className={`chat-window ${isKeyboardVisible ? 'keyboard-visible' : ''}`} 
      ref={chatWindowRef}
    >
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          text={message.text}
          type={message.sender}
          isDocument={message.isDocument}
          documentData={message.documentData}
        />
      ))}
      {isLoading && <LoadingDots />}
    </div>
  );
};

export default ChatWindow;
