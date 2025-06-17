import axios from "axios";
let lastRequestTime = 0;
const fetchAIRecommendations = async (userData) => {
  const now = Date.now();
  if (now - lastRequestTime < 21000) { // 21 seconds = ~3 RPM
    return "Please wait a few seconds before requesting suggestions again.";
  }
  lastRequestTime = now;
  try {
    const headers = {
      'Authorization': 'YOUR-API-KEY',
      'Content-Type': 'application/json'
    };

    const data = {
      model: "gpt-3.5-turbo",  // Updated to GPT-3.5-Turbo (Chat-based model)
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that suggests tasks based on user history."
        },
        {
          role: "user",
          content: `Suggest tasks for a user based on their previous activities: ${userData}`
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    };

    const response = await axios.post("FINE-TUNING-CHAT-GPT-LINK", data, { headers });

    // Check for successful response
    if (response.status === 200) {
      const suggestions = response.data.choices[0].message.content.trim();
      return suggestions;
    } else {
      return `Error: ${response.status}`;
    }
  } catch (error) {
    if (error.response && error.response.status === 429) {
      return "You are sending requests too quickly or have exceeded your quota. Please try again later.";
    } else {
      return `Error fetching task suggestions: ${error.message}`;
    }
  }
};

export { fetchAIRecommendations };
