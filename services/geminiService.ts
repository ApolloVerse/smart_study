
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Question } from '../types';
import { QUESTIONS_PER_DIFFICULTY, SIMULATION_QUESTIONS, SIMULATION_SUBJECT_DISTRIBUTION } from "../constants";

let ai: GoogleGenAI | null = null;
const quizCache = new Map<string, { questions: Question[] }>();
const QUIZ_CACHE_VERSION = 'v1.5'; 

const getAiClient = () => {
    if (!ai) {
        const API_KEY = process.env.API_KEY;
        if (!API_KEY) throw new Error("Chave API não configurada.");
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    return ai;
};

const createQuizSchema = (numQuestions: number) => ({
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: `Lista de ${numQuestions} questões objetivas.`,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "Enunciado direto e contextualizado." },
                    options: { type: Type.ARRAY, description: "4 alternativas plausíveis.", items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING, description: "A resposta correta exata." },
                    explanation: { type: Type.STRING, description: "Explicação lógica curta (máx 120 caracteres) focada no erro comum." }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
            }
        }
    },
    required: ["questions"]
});

const systemInstruction = `Você é o Especialista IA do Smart Study ETEC.
Seu objetivo é preparar alunos para o vestibulinho ETEC com precisão cirúrgica.
- Questões: Devem simular o nível de interpretação exigido pelo Centro Paula Souza.
- Resumos: Devem ser estruturados para revisão rápida (Bullet points).
- Redação: Avalie com base na norma culta e na estrutura dissertativa-argumentativa.
- Velocidade: Seja o mais breve e útil possível.`;

export const generateQuiz = async (subjectName: string, topicName: string, topicId: string, difficulty: 'Fácil' | 'Médio' | 'Difícil'): Promise<{ questions: Question[] }> => {
    const cacheKey = `quiz_v5_${topicId}_${difficulty}`;
    const stored = localStorage.getItem(cacheKey);
    if (stored) return JSON.parse(stored);

    const aiClient = getAiClient();
    const numQuestions = QUESTIONS_PER_DIFFICULTY[difficulty];
    
    const prompt = `Gere um quiz de ${numQuestions} questões nível ${difficulty} sobre "${topicName}" (${subjectName}) para ETEC.`;

    const response = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: createQuizSchema(numQuestions),
            systemInstruction: systemInstruction,
            thinkingConfig: { thinkingBudget: 0 }
        },
    });

    const quizData = JSON.parse(response.text);
    localStorage.setItem(cacheKey, JSON.stringify(quizData));
    return quizData;
};

export const generateStudyContent = async (subjectName: string, topicName: string): Promise<string> => {
    const aiClient = getAiClient();
    const prompt = `Crie um resumo de alto impacto para "${topicName}" (${subjectName}). 
    Use rigorosamente este formato:
    # 🎯 Essencial
    (3 pontos chave)
    # 🔍 Na prova da ETEC
    (Exemplo de como o tema é cobrado ou pegadinha comum)
    # 💡 Macete
    (Uma frase para nunca mais esquecer)`;

    const response = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { 
            systemInstruction: systemInstruction,
            thinkingConfig: { thinkingBudget: 0 }
        }
    });
    return response.text;
};

export const analyzeEssay = async (topic: string, essayContent: string): Promise<{ grade: 'Boa' | 'Mediana' | 'Ruim', feedback: string }> => {
    const aiClient = getAiClient();
    const prompt = `Avalie esta redação ETEC sobre o tema "${topic}": "${essayContent}"`;

    const response = await aiClient.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    grade: { type: Type.STRING, enum: ['Boa', 'Mediana', 'Ruim'] },
                    feedback: { type: Type.STRING, description: "Feedback em Markdown com pontos de melhoria." }
                },
                required: ["grade", "feedback"]
            },
            systemInstruction: "Aja como um corretor rigoroso da banca da ETEC.",
            thinkingConfig: { thinkingBudget: 1024 } 
        }
    });
    return JSON.parse(response.text);
};

export const generateGeneralSimulation = async (): Promise<{ questions: Question[] }> => {
    const aiClient = getAiClient();
    const prompt = `Gere Simulado Geral ETEC: Português, Matemática, Ciências e Humanas.`;

    const response = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: createQuizSchema(SIMULATION_QUESTIONS),
            systemInstruction: systemInstruction,
            thinkingConfig: { thinkingBudget: 0 }
        },
    });
    return JSON.parse(response.text);
};

export const generateEssayTopic = async (previousTopics: string[] = []): Promise<string> => {
    const aiClient = getAiClient();
    const prompt = `Crie um tema de redação baseado em um problema social brasileiro atual. Evite: ${previousTopics.slice(-3).join(", ")}`;

    const response = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { 
            systemInstruction: "Retorne apenas o título do tema.",
            thinkingConfig: { thinkingBudget: 0 }
        }
    });
    return response.text.trim();
};
