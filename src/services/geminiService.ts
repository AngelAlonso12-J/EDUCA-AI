import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ActivityResult {
  titulo: string;
  duracion: string;
  instrucciones: string[];
  entregable: string;
}

export async function generateActivity(module: string, concept: string): Promise<ActivityResult> {
  const prompt = `Eres un experto diseñador instruccional de alto nivel para la carrera de Innovación y Emprendimiento a nivel universitario. 
  Crea una actividad de clase EXTREMADAMENTE DETALLADA, práctica y desafiante basada en:
  Módulo: ${module}
  Concepto/Problema: ${concept}
  
  La actividad debe ser pedagógicamente robusta (basada en aprendizaje activo o metodologías como Design Thinking o Lean Startup).
  
  La respuesta debe ser un objeto JSON con los campos:
  - titulo: Un nombre creativo y profesional para la dinámica.
  - duracion: Tiempo sugerido (ej: "90 minutos dividido en 3 bloques").
  - instrucciones: Una lista de al menos 5-7 pasos muy detallados que incluyan: contextulización, desarrollo técnico de la dinámica y cierre reflexivo.
  - entregable: Un producto tangible de alta calidad que los alumnos deben presentar (ej: "Business Model Canvas validado", "Pitch deck de 5 diapositivas", etc.).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titulo: { type: Type.STRING },
          duracion: { type: Type.STRING },
          instrucciones: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          entregable: { type: Type.STRING }
        },
        required: ["titulo", "duracion", "instrucciones", "entregable"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No se pudo generar el contenido.");
  
  return JSON.parse(text) as ActivityResult;
}
