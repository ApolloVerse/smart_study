
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Question } from '../types';
import { QUESTIONS_PER_DIFFICULTY, SIMULATION_QUESTIONS, SIMULATION_SUBJECT_DISTRIBUTION } from "../constants";

let ai: GoogleGenAI | null = null;
const quizCache = new Map<string, { questions: Question[] }>();
const QUIZ_CACHE_VERSION = 'v1.1'; // Incrementar para invalidar caches antigos de quizzes
const SIMULATION_CACHE_VERSION = 'v1.1'; // Incrementar para invalidar caches antigos de simulados

// Lazily initialize the AI client to prevent app crash on load if the API key is not ready.
const getAiClient = () => {
    if (!ai) {
        const API_KEY = process.env.API_KEY;
        if (!API_KEY) {
            console.error("API_KEY environment variable not set. Please set it in your Vercel project settings.");
            throw new Error("A chave da API não está configurada. Verifique as configurações do projeto.");
        }
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    return ai;
};

const createQuizSchema = (numQuestions: number) => ({
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: `An array of ${numQuestions} multiple-choice questions.`,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The question text." },
                    options: { type: Type.ARRAY, description: "An array of 4 possible answers.", items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING, description: "The correct answer from the options array." },
                    explanation: { type: Type.STRING, description: "A concise explanation (max 2 sentences) for the correct answer." }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
            }
        }
    },
    required: ["questions"]
});

const systemInstruction = `Você é um gerador de conteúdo educacional otimizado para velocidade e precisão para o vestibulinho da ETEC. 
1. Gere JSON válido estritamente.
2. Seja conciso nas explicações para garantir velocidade de resposta.
3. As perguntas devem ser factuais e diretas.`;

const callGeminiWithRetry = async (
    apiCall: () => Promise<GenerateContentResponse>, 
    maxRetries = 3, 
    initialDelay = 2000 // Reduzido drasticamente de 65000 para 2000 para melhorar a experiência do usuário
): Promise<GenerateContentResponse> => {
    let attempts = 0;
    let delay = initialDelay;

    while (attempts < maxRetries) {
        try {
            return await apiCall();
        } catch (error: any) {
            attempts++;
            const isRateLimitError = error.toString().includes('429') || error.toString().includes('RESOURCE_EXHAUSTED');
            
            if (isRateLimitError && attempts < maxRetries) {
                const jitter = Math.random() * 1000;
                const waitTime = delay + jitter;
                console.warn(`Gemini API rate limit exceeded. Retrying in ${waitTime / 1000}s... (Attempt ${attempts}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                delay *= 1.5; // Backoff exponencial mais suave
            } else {
                console.error(`Final error after ${attempts} attempts:`, error);
                if (isRateLimitError) {
                    throw new Error("Atingimos o limite de velocidade da IA. Aguarde alguns segundos e tente novamente.");
                }
                throw error;
            }
        }
    }
    throw new Error("Falha ao conectar com a IA após múltiplas tentativas.");
};


export const generateQuiz = async (subjectName: string, topicName: string, topicId: string, difficulty: 'Fácil' | 'Médio' | 'Difícil'): Promise<{ questions: Question[] }> => {
    const inMemoryCacheKey = `${topicId}-${difficulty}`;
    const storageCacheKey = `quiz_cache_${QUIZ_CACHE_VERSION}_${inMemoryCacheKey}`;

    // 1. Check in-memory cache
    if (quizCache.has(inMemoryCacheKey)) {
        console.log(`Loading quiz from in-memory cache: ${topicName} (${difficulty})`);
        return quizCache.get(inMemoryCacheKey)!;
    }
    
    // 2. Check localStorage
    const storedQuiz = localStorage.getItem(storageCacheKey);
    if (storedQuiz) {
        try {
            const quizData = JSON.parse(storedQuiz);
            if (quizData && quizData.questions) {
                console.log(`Loading quiz from localStorage: ${topicName} (${difficulty})`);
                quizCache.set(inMemoryCacheKey, quizData); 
                return quizData;
            }
        } catch (e) {
            console.error("Failed to parse quiz from localStorage", e);
            localStorage.removeItem(storageCacheKey); 
        }
    }

    console.log(`Generating quiz from API: ${topicName} (${difficulty})`);
    const numQuestions = QUESTIONS_PER_DIFFICULTY[difficulty];

    try {
        const aiClient = getAiClient();
        // Prompt otimizado para brevidade e velocidade
        const prompt = `Gere um quiz rápido de ${numQuestions} perguntas sobre "${topicName}" (${subjectName}). Nível: ${difficulty}. Estilo ETEC. 4 opções por pergunta. Explicações devem ser curtas (máx 20 palavras).`;

        const apiCall = () => aiClient.models.generateContent({
            // Using gemini-3-flash-preview for basic text tasks (Q&A) as recommended.
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: createQuizSchema(numQuestions),
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 0 } // Desativa o "thinking" para resposta instantânea
            },
        });

        const response = await callGeminiWithRetry(apiCall);
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        if (parsedData && Array.isArray(parsedData.questions)) {
            const quizData = { questions: parsedData.questions as Question[] };
            quizCache.set(inMemoryCacheKey, quizData); 
            localStorage.setItem(storageCacheKey, JSON.stringify(quizData)); 
            return quizData;
        } else {
            console.error("Invalid data structure received from Gemini:", parsedData);
            throw new Error("Formato de quiz inválido recebido da API.");
        }

    } catch (error: any) {
        console.error("Error generating quiz with Gemini API:", error);
        throw new Error(error.message || "Erro ao gerar quiz rápido.");
    }
};

const SIMULATION_STORAGE_KEY = `simulation_cache_${SIMULATION_CACHE_VERSION}`;

export const generateGeneralSimulation = async (): Promise<{ questions: Question[] }> => {
    const inMemoryCacheKey = 'simulado-geral';
    
    // 1. Check in-memory cache
    if (quizCache.has(inMemoryCacheKey)) {
        console.log('Loading simulation from in-memory cache.');
        return quizCache.get(inMemoryCacheKey)!;
    }

    // 2. Check localStorage
    const storedSimulation = localStorage.getItem(SIMULATION_STORAGE_KEY);
    if (storedSimulation) {
        try {
            const simulationData = JSON.parse(storedSimulation);
            if (simulationData && simulationData.questions) {
                console.log('Loading simulation from localStorage.');
                quizCache.set(inMemoryCacheKey, simulationData); 
                return simulationData;
            }
        } catch (e) {
            console.error("Failed to parse simulation from localStorage", e);
            localStorage.removeItem(SIMULATION_STORAGE_KEY); 
        }
    }


    console.log(`Generating simulation from API.`);
    try {
        const aiClient = getAiClient();
        // Prompt otimizado para velocidade: pede explicações curtas e foca na distribuição exata
        const prompt = `Gere simulado ETEC com ${SIMULATION_QUESTIONS} questões. Distribuição OBRIGATÓRIA:
- Port: ${SIMULATION_SUBJECT_DISTRIBUTION.portugues}
- Mat: ${SIMULATION_SUBJECT_DISTRIBUTION.matematica}
- Hum: ${SIMULATION_SUBJECT_DISTRIBUTION.ciencias_humanas}
- Nat: ${SIMULATION_SUBJECT_DISTRIBUTION.ciencias_da_natureza}
- Div: ${SIMULATION_SUBJECT_DISTRIBUTION.diversos}
Explicações devem ser muito breves. Priorize velocidade de geração.`;

        const apiCall = () => aiClient.models.generateContent({
            // Using gemini-3-flash-preview for simulation generation as it is a text-based Q&A task.
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: createQuizSchema(SIMULATION_QUESTIONS),
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 0 } // Desativa o thinking para gerar o simulado mais rápido
            },
        });

        const response = await callGeminiWithRetry(apiCall);
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        if (parsedData && Array.isArray(parsedData.questions) && parsedData.questions.length > 0) {
             if (parsedData.questions.length !== SIMULATION_QUESTIONS) {
                console.warn(`API returned ${parsedData.questions.length} questions.`);
            }
            const simulationData = { questions: parsedData.questions as Question[] };
            quizCache.set(inMemoryCacheKey, simulationData); 
            localStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(simulationData)); 
            return simulationData;
        } else {
            console.error("Invalid data structure for simulation:", parsedData);
            throw new Error("A API não retornou questões para o simulado.");
        }

    } catch (error: any) {
        console.error("Error generating simulation:", error);
        throw new Error(error.message || "Erro ao gerar simulado.");
    }
};

export const generateEssayTopic = async (previousTopics: string[] = []): Promise<string> => {
    try {
        const aiClient = getAiClient();
        
        let exclusionText = "";
        if (previousTopics.length > 0) {
            // Take the last 50 topics to avoid extremely long prompts, prioritizing recent ones
            const recentTopics = previousTopics.slice(-50).join("; ");
            exclusionText = `IMPORTANTE: NÃO repita nenhum destes temas já usados: ${recentTopics}.`;
        }

        const prompt = `Gere um tema de redação inédito para o Vestibulinho ETEC/ENEM.
        O tema DEVE OBRIGATORIAMENTE ser baseado em uma notícia ou atualidade real e recente (últimos 2 anos) sobre sociedade, tecnologia, meio ambiente ou geopolítica.
        NÃO crie temas filosóficos abstratos. O tema deve ser um problema concreto da realidade brasileira ou mundial.
        ${exclusionText} 
        Retorne APENAS o título do tema, sem aspas e sem introduções.`;

        const apiCall = () => aiClient.models.generateContent({
            // Using gemini-3-flash-preview for simple text generation.
            model: "gemini-3-flash-preview",
            contents: prompt,
             config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        const response = await callGeminiWithRetry(apiCall);
        const topic = response.text.trim().replace(/['"]/g, ''); 
        if (!topic) throw new Error("Tema vazio.");
        return topic;

    } catch (error: any) {
        console.error("Error generating essay topic:", error);
        throw new Error(error.message || "Erro ao gerar tema.");
    }
};

export const analyzeEssay = async (topic: string, essayContent: string): Promise<{ grade: 'Boa' | 'Mediana' | 'Ruim', feedback: string }> => {
    try {
        const aiClient = getAiClient();
        const prompt = `Analise redação ETEC. Tema: "${topic}". Texto: "${essayContent}". Retorne JSON com grade (Boa/Mediana/Ruim) e feedback markdown curto e objetivo.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                grade: { type: Type.STRING },
                feedback: { type: Type.STRING }
            },
            required: ["grade", "feedback"]
        };

        const apiCall = () => aiClient.models.generateContent({
            // Using gemini-3-pro-preview for essay analysis as it requires advanced reasoning.
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: "Seja um corretor direto e objetivo.",
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        const response = await callGeminiWithRetry(apiCall);
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        if (parsedData && parsedData.grade && parsedData.feedback) {
            return parsedData;
        } else {
            throw new Error("Formato inválido.");
        }

    } catch (error: any) {
        console.error("Error analyzing essay:", error);
        throw new Error(error.message || "Erro na análise.");
    }
};

export const generateStudyContent = async (subjectName: string, topicName: string): Promise<string> => {
    try {
        const aiClient = getAiClient();
        const prompt = `Resumo didático curto sobre "${topicName}" (${subjectName}) para ETEC. Markdown. Definição, Principais Pontos, Dica ETEC.`;

        const apiCall = () => aiClient.models.generateContent({
            // Using gemini-3-flash-preview for summary generation.
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        const response = await callGeminiWithRetry(apiCall);
        return response.text;

    } catch (error: any) {
        console.error("Error generating study content:", error);
        throw new Error("Erro ao gerar conteúdo.");
    }
};
