import { GoogleGenAI, Type } from "@google/genai";
import type { Prediction } from '../types';

// The API key is injected by the environment, so no need to check for it here.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const predictNextWords = async (text: string): Promise<Prediction[]> => {
    try {
        const prompt = `Como un modelo de lenguaje grande (LLM), analiza la frase: "${text}".
Tu tarea es predecir las 5 siguientes palabras (tokens) más probables.
Para cada predicción, proporciona:
1.  La palabra ("word").
2.  Un nivel de confianza simulado de 0.0 a 1.0 ("confidence"), que representa la probabilidad asignada a ese token en la distribución de salida.
3.  Un análisis científico ("analysis") que explique la elección en dos partes:
    a) **Razonamiento Contextual**: Explica cómo el contexto semántico y gramatical de la frase de entrada ("${text}") influye en la alta probabilidad de esta palabra. Menciona las relaciones entre los tokens de entrada y la palabra predicha.
    b) **Justificación de la Confianza**: Justifica el porcentaje de confianza asignado. Explica si la confianza es alta debido a un contexto muy restrictivo (pocas opciones viables) o más baja si el contexto permite múltiples continuaciones lógicas.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        predictions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING },
                                    confidence: { type: Type.NUMBER },
                                    analysis: { type: Type.STRING }
                                },
                                required: ["word", "confidence", "analysis"]
                            }
                        }
                    },
                    required: ["predictions"]
                }
            }
        });
        
        const jsonResponse = JSON.parse(response.text);

        if (jsonResponse && jsonResponse.predictions) {
             return jsonResponse.predictions.sort((a: Prediction, b: Prediction) => b.confidence - a.confidence);
        }
        
        return [];

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get prediction from AI service.");
    }
};