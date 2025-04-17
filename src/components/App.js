import React, { useState, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import './styles/main.scss';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = useCallback(async (text) => {
    // Add user message
    setMessages(prev => [...prev, { text, type: 'user' }]);
    setIsProcessing(true);

    try {
      // Add bot response
      setMessages(prev => [...prev, { 
        text: 'Received your message: ' + text, 
        type: 'bot' 
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDocumentUpload = useCallback((documentData) => {
    // Add document message to chat
    setMessages(prev => [...prev, {
      type: 'user',
      isDocument: true,
      documentData
    }]);

    // Add bot acknowledgment
    setMessages(prev => [...prev, {
      type: 'bot',
      text: `I've received your document "${documentData.name}". I can help you analyze its contents or answer any questions you have about it.`
    }]);
  }, []);

  return (
    <ThemeProvider>
      <div className="chatbot-container">
        <ThemeToggle />
        <div className="chat-session">
          <ChatWindow 
            messages={messages}
          />
          <MessageInput
            onSend={handleSend}
            disabled={isProcessing}
            onDocumentUpload={handleDocumentUpload}
            placeholder="Type a message or upload a document..."
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;