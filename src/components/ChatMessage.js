import React, { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "../context/ThemeContext";
import Modal from "./Modal";

const DocumentMessage = ({ name, timestamp, data }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  const handleDocumentClick = useCallback(() => {
    if (!data) {
      console.error('No document data available');
      return;
    }
    setShowPreview(true);
  }, [data]);

  const handleDownload = useCallback((e) => {
    e.stopPropagation();
    if (!data) return;

    const link = document.createElement('a');
    link.href = data;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data, name]);
  
  return (
    <>
      <div className="document-message" onClick={handleDocumentClick}>
        <svg
          className="document-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
        <div className="document-info">
          <div className="document-name">{name}</div>
          <div className="document-meta">
            {new Date(timestamp).toLocaleString()}
          </div>
        </div>
        <button 
          className="document-download"
          onClick={handleDownload}
          aria-label="Download document"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={name}
      >
        <iframe
          className="pdf-preview"
          src={data}
          title={`Preview of ${name}`}
          type="application/pdf"
        />
      </Modal>
    </>
  );
};

const ChatMessage = ({ text, type, isDocument, documentData }) => {
  const isUser = type === "user";
  const { isDarkMode } = useTheme();

  if (isDocument && documentData) {
    return (
      <div className={`chat-message ${isUser ? "user" : "bot"}`}>
        <div className="bubble">
          <DocumentMessage {...documentData} />
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-message ${isUser ? "user" : "bot"}`}>
      <div className="bubble">
        {isUser ? text : (
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const lang = match ? match[1] : '';
                
                return !inline ? (
                  <SyntaxHighlighter
                    style={isDarkMode ? vscDarkPlus : vs}
                    language={lang}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {text}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
