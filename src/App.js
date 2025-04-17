import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import ThreeBackground from "./components/ThreeBackground";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { sendChatMessage } from "./utils/fakeapi";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme} 
      aria-label="Toggle theme"
    >
      {isDarkMode ? "🌞" : "🌙"}
    </button>
  );
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    setIsLoading(true);
    const userMessage = { sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await sendChatMessage(text);
      
      if (response && response.answer) {
        const botMessage = {
          sender: "bot",
          text: response.answer
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error('No valid response received');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        sender: "bot",
        text: "I'm sorry, I couldn't process your request at the moment. Please try again later."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = (documentData) => {
    // Start chat session if on welcome screen
    if (isFirstVisit) {
      handleStartChat();
    }

    // Add document message to chat
    const documentMessage = {
      sender: "user",
      isDocument: true,
      documentData
    };
    setMessages((prev) => [...prev, documentMessage]);

    // Store document data temporarily
    if (documentData.data) {
      localStorage.setItem(documentData.name, documentData.data);
    }

    // Add bot response
    const botMessage = {
      sender: "bot",
      text: `I've received your document "${documentData.name}". You can click on it to preview or download it.`
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  const handleStartChat = () => {
    setIsFirstVisit(false);
    setMessages([
      { sender: "bot", text: "Hello! I'm here to help answer your questions. What would you like to know?" }
    ]);
  };

  return (
    <>
      <ThreeBackground />
      <div className="chatbot-container">
        <ThemeToggle />
        {isFirstVisit ? (
          <div className="welcome-screen">
            <h2>How can I help you?</h2>
            <MessageInput
              onSend={(text) => {
                handleStartChat();
                handleSend(text);
              }}
              onDocumentUpload={handleDocumentUpload}
              placeholder="Type here and ask..."
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="chat-session">
            <div className="chat-window-wrapper">
              <ChatWindow messages={messages} isLoading={isLoading} />
            </div>
            <MessageInput 
              onSend={handleSend} 
              onDocumentUpload={handleDocumentUpload}
              disabled={isLoading}
            />
          </div>
        )}
      </div>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <ChatInterface />
    </ThemeProvider>
  );
};

export default App;
