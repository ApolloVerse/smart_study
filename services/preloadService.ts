import { STUDY_PLAN_DATA, getTopicById, getSubjectById } from '../constants';
import { generateQuiz, generateGeneralSimulation } from './geminiService';

// Atraso para evitar sobrecarregar a API com requisições de pré-carregamento.
const DELAY_BETWEEN_REQUESTS_MS = 65000;

export const preloadAllQuizzesWithProgress = async (
    onProgress: (progress: { current: number; total: number; topicName: string }) => void
) => {
    // Pré-carrega APENAS o primeiro tópico do plano de estudos e o simulado geral para evitar rate limits.
    const firstDayWithTopics = STUDY_PLAN_DATA.find(day => day.topics.length > 0);
    const firstTopicInfo = firstDayWithTopics?.topics[0];
    
    const tasksToPreload = [];
    if (firstTopicInfo) {
        const firstTopic = getTopicById(firstTopicInfo.topicId);
        if (firstTopic) {
            tasksToPreload.push(firstTopic);
        }
    }

    // Adiciona o simulado geral também. Total de até 2 requisições.
    tasksToPreload.push({ id: 'simulado-geral', name: 'Simulado Geral', subjectId: 'geral' });
    
    const allTasks = tasksToPreload.filter(Boolean);
    const total = allTasks.length;
    let completed = 0;
    
    console.log(`Iniciando pré-carregamento para ${total} tarefas prioritárias com um atraso de ${DELAY_BETWEEN_REQUESTS_MS / 1000}s entre as requisições.`);

    for (const task of allTasks) {
        if (!task) continue;
        try {
            if (task.id === 'simulado-geral') {
                await generateGeneralSimulation();
            } else {
                const subject = getSubjectById(task.subjectId);
                if (subject) {
                   await generateQuiz(subject.name, task.name, task.id, 'Médio');
                }
            }
            console.log(`Pré-carregamento bem-sucedido para: "${task.name}".`);
        } catch (error) {
            console.error(`Falha no pré-carregamento para: "${task.name}".`, error);
        } finally {
            completed++;
            onProgress({ current: completed, total, topicName: task.name });
            
            if (completed < total) {
                const jitter = Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS_MS + jitter));
            }
        }
    }

    console.log('Processo de pré-carregamento concluído.');
};