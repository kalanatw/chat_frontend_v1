import React from "react";
import ReactMarkdown from "react-markdown";

const ChatMessage = ({ text, type }) => {
  const isUser = type === "user";
  return (
    <div className={`chat-message ${isUser ? "user" : "bot"}`}>
      <div className="bubble">
        {isUser ? text : <ReactMarkdown>{text}</ReactMarkdown>}
      </div>
    </div>
  );
};

export default ChatMessage;
