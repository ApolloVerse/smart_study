import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { StudyDay, Topic, User, Subject } from '../types';
import { getSubjectById, getTopicById, SUBJECTS_DATA } from '../constants';
import ClipboardCheckIcon from './icons/ClipboardCheckIcon';
import LockIcon from './icons/LockIcon';
import PlusIcon from './icons/PlusIcon';
import XIcon from './icons/XIcon';
import XCircleIcon from './icons/XCircleIcon';
import StarIcon from './icons/StarIcon';

interface StudyPlannerProps {
  studyPlan: StudyDay[];
  onUpdatePlan: (newPlan: StudyDay[]) => void;
  onStartQuiz: (topic: Topic) => void;
  completedTasks: string[];
  onToggleTask: (taskId: string) => void;
  user: User;
}

const TASK_LIMIT_FREE_PLAN = 50;


// --- Topic Selection Modal ---
interface TopicSelectionModalProps {
    onClose: () => void;
    onAddTopic: (topic: Topic) => void;
    currentTopics: { topicId: string, subjectId: string }[];
}

const TopicSelectionModal: React.FC<TopicSelectionModalProps> = ({ onClose, onAddTopic, currentTopics }) => {
    const [openSubjects, setOpenSubjects] = useState<Set<string>>(new Set());
    const currentTopicIds = new Set(currentTopics.map(t => t.topicId));

    const toggleSubject = (subjectId: string) => {
        setOpenSubjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(subjectId)) newSet.delete(subjectId);
            else newSet.add(subjectId);
            return newSet;
        });
    };

    return createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-fadeInUp" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Adicionar ao Plano</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><XIcon className="w-6 h-6 text-slate-500"/></button>
                </div>
                <div className="overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {SUBJECTS_DATA.map(subject => (
                        <div key={subject.id} className="space-y-2">
                            <button 
                                onClick={() => toggleSubject(subject.id)} 
                                className={`w-full text-left font-black p-4 rounded-xl transition-all flex justify-between items-center ${openSubjects.has(subject.id) ? 'bg-sky-600 text-white shadow-lg scale-[1.02]' : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                            >
                                {subject.name}
                                <span className={`transform transition-transform ${openSubjects.has(subject.id) ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                            {openSubjects.has(subject.id) && (
                                <ul className="grid grid-cols-1 gap-2 p-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl animate-fadeInUp">
                                    {subject.topics.map(topic => {
                                        const isAdded = currentTopicIds.has(topic.id);
                                        return (
                                            <li key={topic.id} className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-800 last:border-0">
                                                <span className="text-slate-700 dark:text-slate-300 font-medium text-sm pr-4">{topic.name}</span>
                                                <button 
                                                    onClick={() => onAddTopic(topic)} 
                                                    disabled={isAdded} 
                                                    className={`text-xs font-black uppercase tracking-widest py-2 px-4 rounded-lg transition-all ${isAdded ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white shadow-sm active:scale-95'}`}
                                                >
                                                    {isAdded ? 'OK' : 'Add'}
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
};


// --- Main Study Planner Component ---
const StudyPlanner: React.FC<StudyPlannerProps> = ({ studyPlan, onUpdatePlan, onStartQuiz, completedTasks, onToggleTask, user }) => {
  const [addingToDay, setAddingToDay] = useState<StudyDay | null>(null);
  const isFreePlan = user.subscriptionPlan === 'free';

  const handleToggle = (taskId: string) => {
    const isCompleted = completedTasks.includes(taskId);
    if (!isCompleted && isFreePlan && completedTasks.length >= TASK_LIMIT_FREE_PLAN) {
      alert(`Você atingiu o limite de ${TASK_LIMIT_FREE_PLAN} tarefas concluídas para o plano gratuito. Faça o upgrade para o Premium para continuar sem limites!`);
      return;
    }
    onToggleTask(taskId);
  };

  const handleAddTopic = (topic: Topic) => {
    if (!addingToDay) return;

    const newPlan = studyPlan.map(dayPlan => {
        if (dayPlan.day === addingToDay.day) {
            return {
                ...dayPlan,
                topics: [...dayPlan.topics, { topicId: topic.id, subjectId: topic.subjectId }]
            };
        }
        return dayPlan;
    });

    onUpdatePlan(newPlan);
    setAddingToDay(null); // Close modal on add
  };

  const handleRemoveTopic = (day: StudyDay['day'], topicId: string) => {
      const newPlan = studyPlan.map(dayPlan => {
          if (dayPlan.day === day) {
              return {
                  ...dayPlan,
                  topics: dayPlan.topics.filter(t => t.topicId !== topicId)
              };
          }
          return dayPlan;
      });
      onUpdatePlan(newPlan);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Plano Semanal</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Organize sua rotina de estudos de forma eficiente.</p>
      </div>

       {isFreePlan && (
            <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 p-4 rounded-2xl flex items-center" role="alert">
                <StarIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                <p className="text-sm font-bold">Modo de Visualização: Upgrade para personalizar seu plano!</p>
            </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyPlan.map(dayPlan => (
          <div key={dayPlan.day} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-50 dark:border-slate-700 flex flex-col min-h-[300px]">
            <h2 className="text-2xl font-black text-sky-600 dark:text-sky-400 mb-6 uppercase tracking-widest text-center">{dayPlan.day}</h2>
            <div className="space-y-3 flex-grow mb-6">
                {dayPlan.topics.length > 0 ? (
                    dayPlan.topics.map(({ topicId, subjectId }) => {
                      const topic = getTopicById(topicId);
                      const subject = getSubjectById(subjectId);
                      if (!topic || !subject) return null;

                      const isCompleted = completedTasks.includes(topic.id);
                      const isLocked = topic.isPremium && isFreePlan;
                      
                      return (
                        <div key={topic.id} className="group flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`task-${topic.id}`}
                            checked={isCompleted}
                            onChange={() => handleToggle(topic.id)}
                            className="h-5 w-5 rounded-lg border-2 border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer dark:bg-slate-900 dark:border-slate-600"
                          />
                          <div className="flex-1 relative">
                            <button
                                onClick={() => onStartQuiz(topic)}
                                className={`w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all ${
                                    isCompleted ? 'opacity-40 grayscale' : ''
                                }`}
                            >
                                <p className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{topic.name}</p>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{subject.name}</p>
                                {isLocked && <LockIcon className="absolute top-2 right-2 w-3 h-3 text-amber-500" />}
                            </button>
                             {!isFreePlan && (
                                <button 
                                    onClick={() => handleRemoveTopic(dayPlan.day, topic.id)}
                                    className="absolute -right-2 -top-2 p-1.5 rounded-full bg-red-500 text-white shadow-lg scale-0 group-hover:scale-100 transition-transform z-10"
                                >
                                    <XIcon className="w-3 h-3"/>
                                </button>
                             )}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl p-4 border-2 border-dashed border-slate-100 dark:border-slate-700">
                    <ClipboardCheckIcon className="w-8 h-8 text-slate-200 dark:text-slate-600 mb-2"/>
                    <p className="text-slate-400 font-medium text-sm italic">Dia Livre</p>
                  </div>
                )}
            </div>
            <button
                onClick={() => setAddingToDay(dayPlan)}
                disabled={isFreePlan}
                className="w-full flex items-center justify-center p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800 font-black uppercase tracking-widest text-xs hover:bg-sky-600 hover:text-white transition-all disabled:opacity-30 disabled:grayscale"
            >
                {isFreePlan ? <LockIcon className="w-4 h-4 mr-2" /> : <PlusIcon className="w-4 h-4 mr-2" />}
                Adicionar Tópico
            </button>
          </div>
        ))}
      </div>
      {addingToDay && (
          <TopicSelectionModal 
            onClose={() => setAddingToDay(null)}
            onAddTopic={handleAddTopic}
            currentTopics={addingToDay.topics}
          />
      )}
    </div>
  );
};

export default React.memo(StudyPlanner);