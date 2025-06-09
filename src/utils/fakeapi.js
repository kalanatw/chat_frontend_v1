import axios from 'axios';

const DOCUMENT_RESPONSE_URL = "http://127.0.0.1:8000/api/chat/";
const TWIN_ID = "c0badfc6-653e-444d-9c35-a3eb549486c6";
const session_id = "session_j740ec9hh_1749486498104";
//const CSRF_TOKEN = "EW9lorNECqB8shaxcL2stmSZJQTRUtLfmWUYxu0DP1AGT6s8DznmvKgEFV8FUJWV";

export const sendChatMessage = async (message) => {
  const payload = {
    message: message,
    twin_version_id: TWIN_ID,
    session_id: parseInt(session_id),
    //response_format: 'markdown' // Format hint for API
  };
  
  const headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
    //'X-CSRFTOKEN': CSRF_TOKEN
  };

  try {
    const response = await axios.post(DOCUMENT_RESPONSE_URL, payload, { headers });
    console.log('API response:', response.data);
    if (!response.data || !response.data.response) {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response format from API');
    }

    // Get the response content
    let formattedAnswer = response.data.response;
    
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
