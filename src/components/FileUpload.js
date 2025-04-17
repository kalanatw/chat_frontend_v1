import React, { useState, useRef } from 'react';
import { uploadDocument } from '../utils/uploadService';
import { useTheme } from '../context/ThemeContext';

const FileUpload = ({ onUploadComplete, onError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);
  const { isDarkMode } = useTheme();

  const updateStatus = (status, isError = false) => {
    setUploadStatus(status);
    if (isError) {
      onError?.(status);
    }
    // Clear status after 5 seconds
    setTimeout(() => setUploadStatus(''), 5000);
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
      updateStatus('Validating file...');
      
      // Read file as base64
      const fileData = await readFileAsBase64(file);
      
      const onProgress = (progress) => {
        setUploadProgress(progress);
        if (progress === 100) {
          updateStatus('Processing upload...');
        }
      };

      await uploadDocument(file, onProgress);
      updateStatus('File uploaded successfully!');
      onUploadComplete?.({
        name: file.name,
        type: 'document',
        timestamp: new Date().toISOString(),
        data: fileData
      });
      
    } catch (error) {
      console.error('Upload failed:', error);
      updateStatus(error.message, true);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFileDialog();
    }
  };

  return (
    <div className="file-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleChange}
        accept=".pdf"
        style={{ display: 'none' }}
        disabled={isUploading}
        aria-label="Choose PDF file"
      />
      <div
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={dragActive ? 'Drop PDF here' : 'Click or drag PDF to upload'}
      >
        {isUploading ? (
          <div className="upload-status" role="status" aria-live="polite">
            <div 
              className="loading-spinner"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={uploadProgress}
            />
            <div className="upload-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="status-text">{uploadStatus || `Uploading... ${uploadProgress}%`}</span>
          </div>
        ) : (
          <>
            <svg 
              className="upload-icon" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span className="upload-text">
              {dragActive ? 'Drop PDF here' : 'Click or drag PDF to upload'}
            </span>
            <span className="upload-hint" aria-hidden="true">
              Maximum file size: 10MB
            </span>
          </>
        )}
      </div>
      {uploadStatus && !isUploading && (
        <div 
          className={`upload-notification ${uploadStatus.includes('failed') || uploadStatus.includes('error') ? 'error' : 'success'}`}
          role="alert"
        >
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default FileUpload;