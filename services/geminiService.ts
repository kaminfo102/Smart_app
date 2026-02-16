import { GoogleGenAI } from "@google/genai";

// Ideally, this should be in an environment variable. 
// For demo purposes, we check existence.
const API_KEY = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const geminiService = {
  sendMessage: async (message: string): Promise<string> => {
    if (!ai) {
      return "برای استفاده از هوش مصنوعی، لطفاً کلید API را تنظیم کنید. (API Key missing)";
    }

    try {
      const systemInstruction = `
        شما یک دستیار خرید هوشمند و مودب برای فروشگاه "دیجی‌نکست" هستید.
        زبان شما فارسی است.
        وظیفه شما راهنمایی مشتریان برای خرید محصولات است.
        
        قوانین:
        1. درباره محصولات عمومی فروشگاه صحبت کنید.
        2. پاسخ‌های کوتاه و مفید بدهید.
        3. لحن شما باید دوستانه و حرفه‌ای باشد.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: message,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      return response.text || "متاسفانه نمی‌توانم در حال حاضر پاسخ دهم.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "خطایی در ارتباط با هوش مصنوعی رخ داد. لطفا دوباره تلاش کنید.";
    }
  }
};