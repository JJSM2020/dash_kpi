
import { GoogleGenAI } from "@google/genai";
import { MainKPI } from "../types";

export const getAIInsight = async (kpis: MainKPI[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const context = kpis.map(k => `${k.label}: ${k.value} (Meta: ${k.target}, Status: ${k.status})`).join(', ');
  
  const prompt = `
    Aja como um especialista em engenharia de manutenção. 
    Analise os seguintes indicadores de desempenho (KPIs): ${context}.
    Identifique o principal problema e forneça um insight curto, direto e acionável em Português do Brasil (máximo 150 caracteres).
    Foque especialmente nos KPIs com status 'danger' ou 'warning'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao conectar com a IA para análise.";
  }
};
