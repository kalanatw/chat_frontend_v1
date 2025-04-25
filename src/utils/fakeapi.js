import axios from 'axios';

const DOCUMENT_RESPONSE_URL = "http://127.0.0.1:8000/core/api/document-response/";
const TWIN_ID = "b7586e58-9a07-47f6-8049-43d6d6f2c5e54455";
const CHAT_INSTANCE_ID = "32";
const CSRF_TOKEN = "EW9lorNECqB8shaxcL2stmSZJQTRUtLfmWUYxu0DP1AGT6s8DznmvKgEFV8FUJWV";

export const sendChatMessage = async (message) => {
  const payload = {
    query: message,
    twin_version_id: TWIN_ID,
    chat_instance_id: parseInt(CHAT_INSTANCE_ID),
    response_format: 'markdown' // Format hint for API
  };
  
  const headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CSRFTOKEN': CSRF_TOKEN
  };

  try {
    const response = await axios.post(DOCUMENT_RESPONSE_URL, payload, { headers });
    
    if (!response.data || !response.data.openai_response) {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response format from API');
    }

    // Get the response content
    let formattedAnswer = response.data.openai_response.content;
    
    // Ensure code blocks are properly formatted
    formattedAnswer = formattedAnswer.replace(/```(\w+)?\n/g, '```$1\n');
    
    return {
      answer: formattedAnswer
    };
  } catch (error) {
    console.error('API call error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};
