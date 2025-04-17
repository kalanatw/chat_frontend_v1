import axios from 'axios';

const UPLOAD_ENDPOINT = '/upload-kafka'; // Changed to relative URL for proxy support
const TWIN_VERSION_ID = 'b7586e58-9a07-47f6-8049-43d6d6f2c5e54455';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const logUploadStep = (step, details) => {
  console.log(`[Upload ${step}]:`, details);
};

export const validateFile = (file) => {
  logUploadStep('Validation', { fileName: file?.name, fileSize: file?.size, fileType: file?.type });
  
  if (!file) {
    throw new Error('Please select a file');
  }

  if (!file.type || !file.type.match('application/pdf')) {
    throw new Error('Please upload a valid PDF file');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 10MB');
  }

  return true;
};

export const generateMetadata = () => {
  // Simplified metadata structure as per requirements
  const metadata = {
    twin_version_id: TWIN_VERSION_ID,
    document_type: 'document'
  };
  
  logUploadStep('Metadata Generation', metadata);
  return metadata;
};

const createMetadataFile = (metadata) => {
  const blob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: 'application/json'
  });
  
  logUploadStep('Metadata File Creation', { 
    metadata 
  });
  
  return blob;
};

const handleNifiResponse = async (response) => {
  logUploadStep('NIFI Response', {
    status: response.status,
    statusText: response.statusText,
    data: response.data
  });

  // Handle NIFI's null response on success
  if (response.status === 200) {
    if (response.data === null) {
      return { success: true, message: 'File uploaded successfully' };
    }
    return response.data;
  }
  
  throw new Error('Upload failed');
};

export const uploadDocument = async (file, onProgress) => {
  try {
    logUploadStep('Start', { fileName: file.name });
    validateFile(file);

    // Generate metadata
    const baseName = file.name.replace(/\.pdf$/i, '');
    const metadata = generateMetadata();
    const metadataBlob = createMetadataFile(metadata);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('meta_data', metadataBlob, `${baseName}.json`);

    logUploadStep('Request Preparation', {
      fileName: file.name,
      metadataName: `${baseName}.json`,
      formDataEntries: Array.from(formData.entries()).map(([key]) => key)
    });

    const response = await axios.post(UPLOAD_ENDPOINT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        logUploadStep('Progress', { percent: percentCompleted });
        onProgress?.(percentCompleted);
      }
    });

    const result = await handleNifiResponse(response);
    logUploadStep('Complete', { result });
    return result;
    
  } catch (error) {
    logUploadStep('Error', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to upload document. Please try again.'
    );
  }
};