
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const editImageWithAI = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    if (
      response.candidates &&
      response.candidates[0].content.parts[0].inlineData
    ) {
      return response.candidates[0].content.parts[0].inlineData.data;
    } else {
      const safetyReason = response.candidates?.[0]?.finishReason;
      if (safetyReason && safetyReason !== 'STOP') {
        throw new Error(`Image generation stopped due to safety settings. Reason: ${safetyReason}`);
      }
      throw new Error("AI did not return an image. Please try a different prompt or image.");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to process image with AI. Please check the console for details.");
  }
};
