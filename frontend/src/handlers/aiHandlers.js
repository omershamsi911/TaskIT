import api from "../api/api";

export const sendToAISupport = async (message) => {
  try {
    const response = await api.post("/ai/support", { message });
    
    return {
      text: response.data.text,
      source: response.data.source,
      category: response.data.category,
      needsEscalation: response.data.needs_escalation,
    };
  } catch (error) {
    console.error("[AI Handler] API error:", error);
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.detail || "Failed to get response from AI support";
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("Unable to connect to AI support. Please check your connection.");
    } else {
      // Something else happened
      throw new Error("An unexpected error occurred. Please try again.");
    }
  }
};

export const checkAIHealth = async () => {
  try {
    const response = await api.get("/ai/health");
    return response.data;
  } catch (error) {
    console.error("[AI Handler] Health check error:", error);
    return {
      status: "unhealthy",
      ai_available: false,
      kb_available: false,
      knowledge_base_size: 0
    };
  }
};

export const searchKnowledgeBase = async (query) => {
  try {
    const response = await api.get(`/ai/knowledge-base/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error("[AI Handler] KB search error:", error);
    return { found: false, message: "Search failed" };
  }
};