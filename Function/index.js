const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");

const geminiApiKey = defineSecret("GEMINI_API_KEY");

exports.chatWithBeshy = onCall(
  {
    region: "us-central1",
    secrets: [geminiApiKey],
    maxInstances: 10,
  },
  async (request) => {
    const message = request.data?.message;

    if (typeof message !== "string" || !message.trim()) {
      throw new HttpsError(
        "invalid-argument",
        "Please enter a message."
      );
    }

    try {
      const {GoogleGenAI} = await import("@google/genai");

      const ai = new GoogleGenAI({
        apiKey: geminiApiKey.value(),
      });

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message.trim(),
      });

      return {
        reply: result.text,
      };
   } catch (error) {
  console.error("Gemini request failed", {
    name: error?.name,
    message: error?.message,
    status: error?.status,
    stack: error?.stack,
  });

  throw new HttpsError(
    "internal",
    error?.message || "Beshy could not generate a response."

      );
    }
  }
);
