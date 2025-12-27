
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const validateWords = async (
  letter: string,
  categories: string[],
  playerSubmissions: { playerId: string; words: Record<string, string> }[]
) => {
  const prompt = `
    You are the official judge for QuickMadu, a fast-thinking word game.
    The current round letter is: "${letter}".
    
    Check if the submitted words for each player are valid according to these rules:
    1. The word must start with the letter "${letter}".
    2. The word must realistically fit the category.
    3. Proper nouns are allowed if they fit.
    
    For each valid word:
    - If only ONE player provided that specific word for that category: 10 points.
    - If MULTIPLE players provided the same valid word for that category: 5 points each.
    - If the word is invalid (wrong letter or wrong category): 0 points.

    Players and their submissions:
    ${JSON.stringify(playerSubmissions)}

    Respond strictly in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            playerResults: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  playerId: { type: Type.STRING },
                  results: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        category: { type: Type.STRING },
                        word: { type: Type.STRING },
                        isValid: { type: Type.BOOLEAN },
                        points: { type: Type.NUMBER },
                        reason: { type: Type.STRING }
                      },
                      required: ['category', 'word', 'isValid', 'points']
                    }
                  },
                  totalRoundPoints: { type: Type.NUMBER }
                },
                required: ['playerId', 'results', 'totalRoundPoints']
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Validation Error:", error);
    // Fallback: simple client side validation if API fails
    return null;
  }
};
