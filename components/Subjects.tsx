import React, { useState } from 'react';
import { Topic, User, Subject } from '../types';
import { SUBJECTS_DATA } from '../constants';
import ChevronDownIcon from './icons/ChevronDownIcon';
import LockIcon from './icons/LockIcon';
import StarIcon from './icons/StarIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import StudyMaterialModal from './StudyMaterialModal';

interface SubjectsProps {
  onStartQuiz: (topic: Topic) => void;
  user: User;
}

const Subjects: React.FC<SubjectsProps> = ({ onStartQuiz, user }) => {
  const [openSubjects, setOpenSubjects] = useState<Set<string>>(new Set());
  const [studyingTopic, setStudyingTopic] = useState<{ topic: Topic, subject: Subject } | null>(null);

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

  const handleOpenStudy = (topic: Topic, subject: Subject) => {
      setStudyingTopic({ topic, subject });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Disciplinas</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Explore os tópicos, estude a teoria e teste seus conhecimentos.</p>
      </div>
      
      <div className="space-y-4">
        {SUBJECTS_DATA.map(subject => (
          <div key={subject.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => toggleSubject(subject.id)}
              className="w-full flex justify-between items-center p-4 sm:p-6 text-left"
              aria-expanded={openSubjects.has(subject.id)}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-sky-500 dark:text-sky-400">{subject.name}</h2>
              <ChevronDownIcon 
                className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${openSubjects.has(subject.id) ? 'rotate-180' : ''}`} 
              />
            </button>
            {openSubjects.has(subject.id) && (
              <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-200 dark:border-slate-700 animate-fadeInUp">
                <ul className="space-y-3">
                  {subject.topics.map(topic => {
                    const isLocked = topic.isPremium && user.subscriptionPlan === 'free';
                    return (
                      <li key={topic.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg gap-4">
                        <div className="flex items-center flex-1">
                          {isLocked && <LockIcon className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />}
                          <span className={`font-medium text-slate-800 dark:text-slate-200 ${isLocked ? 'opacity-70' : ''}`}>{topic.name}</span>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto">
                             <button
                                onClick={() => handleOpenStudy(topic, subject)}
                                className="flex-1 md:flex-none py-2 px-4 rounded-lg text-sm font-semibold border border-sky-500 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors flex items-center justify-center"
                             >
                                <BookOpenIcon className="w-4 h-4 mr-2" />
                                Material de Estudo
                             </button>

                            <button
                              onClick={() => onStartQuiz(topic)}
                              className={`flex-1 md:flex-none font-bold py-2 px-4 rounded-lg text-sm transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center text-white shadow-md ${
                                isLocked 
                                ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-900' 
                                : 'bg-primary hover:bg-sky-500'
                              }`}
                            >
                              {isLocked && <StarIcon className="w-4 h-4 mr-2" />}
                              {isLocked ? 'Desbloquear' : 'Começar Quiz'}
                            </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {studyingTopic && (
          <StudyMaterialModal 
            topic={studyingTopic.topic}
            subject={studyingTopic.subject}
            onClose={() => setStudyingTopic(null)}
            onStartQuiz={onStartQuiz}
          />
      )}
    </div>
  );
};

export default React.memo(Subjects);