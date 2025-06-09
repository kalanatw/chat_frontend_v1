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
      text: `Thank you for uploading "${documentData.name}". I've received your document and can help you analyze or discuss its contents. You can click on it to preview or download it. How would you like me to assist you with this document?`
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  const handleStartChat = () => {
    setIsFirstVisit(false);
    setMessages([
      { sender: "bot", text: "Hello! Welcome to AAS Customer Support. I'm your AI assistant, ready to help you with any questions about our services, products, or technical support. How can I assist you today?" }
    ]);
  };

  return (
    <>
      <ThreeBackground />
      <div className="chatbot-container">
        <ThemeToggle />
        {isFirstVisit ? (
          <div className="welcome-screen">
            <div className="brand-container">
              <img 
                src="/AAS_Logo.jpeg" 
                alt="AAS Logo" 
                className="aas-logo"
              />
              <h2>AAS Customer Support Center</h2>
              {/* <p className="brand-subtitle">Powered by Advanced AI Technology</p> */}
            </div>
            <MessageInput
              onSend={(text) => {
                handleStartChat();
                handleSend(text);
              }}
              onDocumentUpload={handleDocumentUpload}
              placeholder="Ask me anything about AAS services..."
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="chat-session">
            <div className="chat-header">
              <div className="brand-header">
                <img 
                  src="/AAS_Logo.jpeg" 
                  alt="AAS Logo" 
                  className="header-logo"
                />
                <div className="header-text">
                  <h3>AAS Support</h3>
                  <span className="status-indicator">● Online</span>
                </div>
              </div>
            </div>
            <div className="chat-window-wrapper">
              <ChatWindow messages={messages} isLoading={isLoading} />
            </div>
            <MessageInput 
              onSend={handleSend} 
              onDocumentUpload={handleDocumentUpload}
              placeholder="Type your message to AAS support..."
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
