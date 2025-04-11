import React from "react";

const ChatMessage = ({ text, type }) => {
  const isUser = type === "user";
  return (
    <div className={`chat-message ${isUser ? "user" : "bot"}`}>
      <div className="bubble">{text}</div>
    </div>
  );
};

export default ChatMessage;
