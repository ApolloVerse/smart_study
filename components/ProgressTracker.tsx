import React, { useMemo, useState } from 'react';
import { Progress, User } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { SUBJECTS_DATA, getTopicById, getSubjectById } from '../constants';
import ChevronDownIcon from './icons/ChevronDownIcon';
import StarIcon from './icons/StarIcon';
// FIX: Import ChartBarIcon to resolve 'Cannot find name' error.
import ChartBarIcon from './icons/ChartBarIcon';

interface ProgressTrackerProps {
  progress: Progress;
  user: User;
  onNavigate: (page: 'subscription') => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progress, user, onNavigate }) => {
  const [openSubjects, setOpenSubjects] = useState<Set<string>>(new Set());

  const toggleSubject = (subjectId: string) => {
    setOpenSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };
  
  const topicStatsBySubject = useMemo(() => {
    const stats: { 
      [subjectId: string]: { 
        [topicId: string]: { 
          correct: number;
          total: number;
        } 
      } 
    } = {};

    progress.quizHistory.forEach(attempt => {
      if (attempt.subjectId && attempt.topicId && attempt.correctAnswers !== undefined && attempt.totalQuestions !== undefined && attempt.topicId !== 'simulado-geral') {
        if (!stats[attempt.subjectId]) {
          stats[attempt.subjectId] = {};
        }
        if (!stats[attempt.subjectId][attempt.topicId]) {
          stats[attempt.subjectId][attempt.topicId] = { correct: 0, total: 0 };
        }
        stats[attempt.subjectId][attempt.topicId].correct += attempt.correctAnswers;
        stats[attempt.subjectId][attempt.topicId].total += attempt.totalQuestions;
      }
    });

    return stats;
  }, [progress.quizHistory]);

  const lineChartData = progress.quizHistory.map((attempt, index) => ({
    name: `Quiz ${index + 1}`,
    Pontuação: attempt.score,
    topic: getTopicById(attempt.topicId)?.name || 'Simulado Geral',
  }));
  
  const barChartData = SUBJECTS_DATA.map(subject => {
    const stat = progress.subjectStats[subject.id];
    const accuracy = stat && stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
    return {
      name: subject.name,
      Precisão: accuracy,
    };
  });

  const isDarkMode = document.documentElement.classList.contains('dark');
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
  const tooltipBg = isDarkMode ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#334155' : '#e2e8f0';

  if (user.subscriptionPlan === 'free') {
    return (
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
            <div className="p-4 bg-sky-500/20 rounded-full mb-4">
                <ChartBarIcon className="w-12 h-12 text-sky-500 dark:text-sky-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Desbloqueie seus Relatórios</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-md">Acompanhe seu progresso detalhado e identifique seus pontos fortes e fracos com o plano Essencial ou Premium.</p>
            <button onClick={() => onNavigate('subscription')} className="bg-primary hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 active:scale-95">Ver Planos</button>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Seu Progresso</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Analise seu desempenho para focar nos pontos fracos.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold text-sky-500 dark:text-sky-400 mb-6">Desempenho Detalhado por Tópico</h2>
        {Object.keys(topicStatsBySubject).length > 0 ? (
          <div className="space-y-2">
            {SUBJECTS_DATA.map(subject => {
              const subjectStats = topicStatsBySubject[subject.id];
              if (!subjectStats) return null;

              const topicValues = Object.values(subjectStats) as { correct: number; total: number }[];
              const overallCorrect = topicValues.reduce((acc, t) => acc + t.correct, 0);
              const overallTotal = topicValues.reduce((acc, t) => acc + t.total, 0);
              const overallAccuracy = overallTotal > 0 ? (overallCorrect / overallTotal) * 100 : 0;

              return (
                <div key={subject.id} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                  <button
                    onClick={() => toggleSubject(subject.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md transition-colors"
                    aria-expanded={openSubjects.has(subject.id)}
                  >
                    <span className="font-bold text-lg text-slate-800 dark:text-slate-100 text-left">{subject.name}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold">{overallAccuracy.toFixed(0)}%</span>
                      <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${openSubjects.has(subject.id) ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {openSubjects.has(subject.id) && (
                    <div className="pl-6 pr-3 pb-3 pt-2 space-y-4 animate-fadeInUp animation-delay-100">
                      {subject.topics.map(topic => {
                        const topicStat = subjectStats[topic.id];
                        if (!topicStat) return null;

                        const accuracy = topicStat.total > 0 ? (topicStat.correct / topicStat.total) * 100 : 0;
                        return (
                          <div key={topic.id}>
                            <div className="flex justify-between items-center mb-1 text-sm">
                              <span className="text-slate-600 dark:text-slate-300">{topic.name}</span>
                              <span className="font-medium text-slate-500 dark:text-slate-400">{topicStat.correct} / {topicStat.total}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                              <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${accuracy}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center py-10">Complete um quiz para que seus dados de progresso apareçam aqui.</p>
        )}
      </div>

       <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold text-sky-500 dark:text-sky-400 mb-6">Evolução ao Longo do Tempo</h2>
        {progress.quizHistory.length > 1 ? (
          <div className="w-full h-[300px] sm:h-[400px]">
            <ResponsiveContainer>
              <LineChart
                data={lineChartData}
                margin={{ top: 5, right: 20, left: -15, bottom: 5, }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: textColor, fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: textColor, borderRadius: '0.5rem' }}
                  labelStyle={{ color: isDarkMode ? '#cbd5e1' : '#334155', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ color: textColor }} />
                <Line type="monotone" dataKey="Pontuação" stroke="#0ea5e9" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center py-10">Complete pelo menos dois quizzes para ver sua curva de evolução.</p>
        )}
      </div>

      {user.subscriptionPlan === 'premium' ? (
         <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-500 dark:text-yellow-400 mb-6 flex items-center">
            <StarIcon className="w-6 h-6 mr-2" />
            Análise Avançada (Premium)
          </h2>
          <div className="w-full h-[300px] sm:h-[400px] overflow-x-auto">
            <div className="min-w-[500px] h-full">
                <ResponsiveContainer>
                   <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -15, bottom: 5, }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
                      <YAxis domain={[0, 100]} tick={{ fill: textColor, fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: textColor, borderRadius: '0.5rem' }}
                        labelStyle={{ color: isDarkMode ? '#cbd5e1' : '#334155', fontWeight: 'bold' }}
                        cursor={{fill: 'rgba(2, 132, 199, 0.1)'}}
                      />
                      <Bar dataKey="Precisão" fill="#0ea5e9" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
         </div>
      ) : (
         <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
            <div className="p-4 bg-yellow-500/20 rounded-full mb-4">
                <StarIcon className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Desbloqueie a Análise Avançada</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-md">Compare seu desempenho entre as disciplinas e obtenha insights mais profundos com o plano Premium.</p>
            <button onClick={() => onNavigate('subscription')} className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 active:scale-95">Ver Plano Premium</button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProgressTracker);