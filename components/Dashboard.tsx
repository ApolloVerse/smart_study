import React, { useMemo, useState, useEffect } from 'react';
import { Progress, Topic, User, QuizState } from '../types';
import { SUBJECTS_DATA, getSubjectById, getTopicById, FREE_PLAN_SIMULATION_LIMIT } from '../constants';
import ChartBarIcon from './icons/ChartBarIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import SparklesIcon from './icons/SparklesIcon';
import LockIcon from './icons/LockIcon';
import PlusIcon from './icons/PlusIcon';
import ClockIcon from './icons/ClockIcon';

interface DashboardProps {
  progress: Progress;
  onStartQuiz: (topic?: Topic) => void;
  onResumeQuiz: (quizState: QuizState) => void;
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ progress, onStartQuiz, onResumeQuiz, user }) => {
  const [savedQuizzes, setSavedQuizzes] = useState<QuizState[]>([]);

  useEffect(() => {
    // Check for saved quizzes map in localStorage
    const savedMap = localStorage.getItem(`saved_quizzes_${user.username}`);
    // Check legacy single quiz key for migration (optional, keeps code clean to just check map)
    const legacySaved = localStorage.getItem(`quiz_progress_${user.username}`);

    let quizzes: QuizState[] = [];

    if (savedMap) {
      try {
        const parsedMap = JSON.parse(savedMap);
        quizzes = Object.values(parsedMap);
      } catch (e) {
        console.error("Failed to parse saved quizzes map", e);
      }
    } else if (legacySaved) {
        // Migration support: if we have a legacy single quiz, treat it as one item
        try {
            const parsed = JSON.parse(legacySaved);
            quizzes = [parsed];
        } catch (e) { console.error(e); }
    }

    // Sort by most recently updated
    quizzes.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    
    setSavedQuizzes(quizzes);
  }, [user.username]);

  const totalQuizzes = progress.quizHistory.length;
  
  const overallAccuracy = useMemo(() => {
    const stats = Object.values(progress.subjectStats) as { correct: number; total: number }[];
    const totalCorrect = stats.reduce((acc, stat) => acc + stat.correct, 0);
    const totalAttempted = stats.reduce((acc, stat) => acc + stat.total, 0);
    return totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : '0.0';
  }, [progress.subjectStats]);
  
  const suggestedTopic = useMemo(() => {
      const quizzedTopicIds = new Set(progress.quizHistory.map(q => q.topicId));
      for (const subject of SUBJECTS_DATA) {
          for (const topic of subject.topics) {
              if (!quizzedTopicIds.has(topic.id)) {
                  return topic;
              }
          }
      }
      return SUBJECTS_DATA[0].topics[0];
  }, [progress.quizHistory]);
  
  const generalSimulationTopic: Topic = {
    id: 'simulado-geral',
    name: 'Simulado Geral - Prova Completa',
    subjectId: 'geral',
  };
  
  const { subscriptionPlan } = user;
  const simulationAttempts = progress.simulationAttempts || 0;
  const freeSimLimitReached = subscriptionPlan === 'free' && simulationAttempts >= FREE_PLAN_SIMULATION_LIMIT;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Bem-vindo, {user.username}!</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Vamos conquistar seus objetivos. Aqui está um resumo do seu progresso.</p>
      </div>

      {user.subscriptionPlan === 'free' && (
        <div className="bg-slate-200 dark:bg-slate-700/50 p-4 rounded-lg text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300">Desbloqueie todo o potencial dos seus estudos com o plano Premium! ✨</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative bg-gradient-to-r from-sky-500 to-indigo-600 p-6 rounded-lg shadow-lg col-span-1 md:col-span-3 text-center">
          {freeSimLimitReached && (
              <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center p-4 z-10">
                  <LockIcon className="w-10 h-10 text-yellow-400 mb-2" />
                  <h3 className="text-lg font-bold text-white">Limite de Simulado Atingido</h3>
                  <p className="text-yellow-200 text-sm">Faça upgrade para ter simulados ilimitados!</p>
              </div>
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Pronto para o Desafio?</h2>
          <p className="text-sky-100 mb-4">Teste seus conhecimentos com uma simulação completa da prova.</p>
          <button 
            onClick={() => onStartQuiz(generalSimulationTopic)}
            disabled={freeSimLimitReached}
            className="bg-white text-primary font-bold py-3 px-6 sm:px-8 rounded-lg transition-transform transform hover:scale-105 active:scale-100 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Iniciar Simulado Geral
          </button>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-sky-500/20 rounded-full">
              <ChartBarIcon className="w-6 h-6 text-sky-500 dark:text-sky-400" />
            </div>
            <div className="ml-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Precisão Geral</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{overallAccuracy}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-500/20 rounded-full">
               <BookOpenIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="ml-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Quizzes Realizados</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalQuizzes}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Próximo Tópico Sugerido</p>
            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1 line-clamp-1" title={suggestedTopic?.name}>{suggestedTopic?.name}</p>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <button 
              onClick={() => onStartQuiz(suggestedTopic)}
              className="w-full bg-primary hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 active:scale-95 text-sm"
            >
              Começar Sugerido
            </button>
            <button 
              onClick={() => onStartQuiz()}
              className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center text-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Quiz Personalizado
            </button>
          </div>
        </div>
      </div>

      {user.subscriptionPlan === 'premium' && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
            <SparklesIcon className="w-6 h-6 text-yellow-500 mr-2" />
            Recomendações com IA
          </h2>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg text-center">
             <p className="text-slate-500 dark:text-slate-400">Com base no seu desempenho, recomendamos focar em <strong>{getSubjectById(suggestedTopic.subjectId)?.name}</strong> para maximizar seu progresso.</p>
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">Atividade Recente</h2>
        <div className="space-y-4">
            {/* List of Resumable Quizzes */}
            {savedQuizzes.length > 0 && (
              <div className="space-y-3 mb-6">
                 <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Continuar Estudando ({savedQuizzes.length})</h3>
                 {savedQuizzes.map((quiz, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border-l-4 border-yellow-400 flex flex-col sm:flex-row justify-between items-center gap-4 transition-transform hover:scale-[1.01]">
                        <div className="flex items-center w-full">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mr-4 flex-shrink-0">
                                <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Em Andamento</p>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{quiz.topic.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Questão {quiz.currentQuestionIndex + 1} de {quiz.questions.length} • {new Date(quiz.lastUpdated).toLocaleDateString('pt-BR')} às {new Date(quiz.lastUpdated).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => onResumeQuiz(quiz)}
                            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-transform active:scale-95 shadow-md whitespace-nowrap"
                        >
                            Continuar
                        </button>
                    </div>
                 ))}
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
            {progress.quizHistory.length > 0 ? (
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {progress.quizHistory.slice(-5).reverse().map((attempt, index) => {
                    const topic = attempt.topicId === 'simulado-geral' ? generalSimulationTopic : getTopicById(attempt.topicId);
                    const subject = attempt.subjectId === 'geral' ? {name: 'Geral'} : getSubjectById(attempt.subjectId);
                    return (
                    <li key={index} className="py-3 flex justify-between items-center flex-wrap">
                        <div className="pr-4">
                        <p className="font-semibold text-slate-800 dark:text-white">{topic?.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{subject?.name} - {new Date(attempt.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <p className={`font-bold text-lg ${attempt.score >= 70 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        {attempt.score.toFixed(0)}%
                        </p>
                    </li>
                    );
                })}
                </ul>
            ) : (
                <div className="text-center py-8">
                    <SparklesIcon className="w-16 h-16 mx-auto text-yellow-400 dark:text-yellow-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Dê o primeiro passo!</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-md mx-auto">Comece seus estudos com o tópico que sugerimos para você e veja sua atividade aqui.</p>
                    <button 
                        onClick={() => onStartQuiz(suggestedTopic)}
                        className="bg-primary hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 active:scale-95"
                    >
                        Começar Quiz de "{suggestedTopic.name}"
                    </button>
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);