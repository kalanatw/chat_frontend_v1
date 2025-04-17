import React, { useState, useRef, useEffect } from "react";
import Toast from "./Toast";
import { uploadDocument } from '../utils/uploadService';

const MessageInput = ({ onSend, placeholder = "Type your message...", disabled, onDocumentUpload }) => {
  const [text, setText] = useState("");
  const [toast, setToast] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (isComposing) return;
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Read file as base64
      const fileData = await readFileAsBase64(file);
      
      const onProgress = (progress) => {
        setUploadProgress(progress);
      };

      await uploadDocument(file, onProgress);
      showToast(`Successfully uploaded ${file.name}`);
      onDocumentUpload?.({
        name: file.name,
        type: 'document',
        timestamp: new Date().toISOString(),
        data: fileData
      });
      
    } catch (error) {
      console.error('Upload failed:', error);
      showToast(error.message, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 576) return; // Only apply on mobile

      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY;
      const nearBottom = window.innerHeight + currentScrollY >= document.documentElement.scrollHeight - 100;

      setIsVisible(scrollingUp || nearBottom);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Show input when focused
  const handleInputFocus = () => {
    if (window.innerWidth <= 576) {
      setIsVisible(true);
    }
  };

  return (
    <>
      <div className={`message-input ${!isVisible ? 'message-input-hidden' : ''}`}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          disabled={disabled}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          aria-label="Message input"
        />
        <label className="upload-button" aria-label="Upload document">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            style={{ display: 'none' }}
            disabled={isUploading || disabled}
          />
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
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {isUploading && (
            <div className="upload-progress-indicator" style={{ width: `${uploadProgress}%` }} />
          )}
        </label>
        <button 
          onClick={handleSend} 
          disabled={disabled || !text.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default MessageInput;
