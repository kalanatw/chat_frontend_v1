import React, { useState, useRef, useEffect } from "react";

const MessageInput = ({ onSend, placeholder = "Type your message...", disabled }) => {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [text]);

  return (
    <div className="message-input">
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button 
        onClick={handleSend} 
        disabled={disabled || !text.trim()}
      >
        {disabled ? "Sending..." : "Send"}
      </button>
    </div>
  );
};

export default MessageInput;
