import React, { useState, useEffect } from 'react';
import { Topic, User, Subject } from '../types';
import { SUBJECTS_DATA } from '../constants';
import XIcon from './icons/XIcon';
import LockIcon from './icons/LockIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface DifficultyModalProps {
    initialTopic?: Topic | null;
    onClose: () => void;
    onConfirm: (topic: Topic, difficulty: 'Fácil' | 'Médio' | 'Difícil') => void;
    user: User;
}

type Step = 'subject' | 'topic' | 'difficulty';

const DifficultyModal: React.FC<DifficultyModalProps> = ({ initialTopic, onClose, onConfirm, user }) => {
    const [step, setStep] = useState<Step>('difficulty');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    // If initialTopic provided, jump straight to difficulty
    useEffect(() => {
        if (initialTopic) {
            setSelectedTopic(initialTopic);
            setStep('difficulty');
        } else {
            setStep('subject');
        }
    }, [initialTopic]);

    const handleSelectSubject = (subject: Subject) => {
        setSelectedSubject(subject);
        setStep('topic');
    };

    const handleSelectTopic = (topic: Topic) => {
        setSelectedTopic(topic);
        setStep('difficulty');
    };

    const handleSelectDifficulty = (difficulty: 'Fácil' | 'Médio' | 'Difícil') => {
        if (selectedTopic) {
            onConfirm(selectedTopic, difficulty);
        }
    };
    
    const handleBack = () => {
        if (step === 'difficulty' && !initialTopic) {
            setStep('topic');
        } else if (step === 'topic') {
            setStep('subject');
        }
    };

    const difficulties: Array<'Fácil' | 'Médio' | 'Difícil'> = ['Fácil', 'Médio', 'Difícil'];
    const isFreePlan = user.subscriptionPlan === 'free';

    const renderContent = () => {
        switch (step) {
            case 'subject':
                return (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {SUBJECTS_DATA.map(subject => (
                            <button
                                key={subject.id}
                                onClick={() => handleSelectSubject(subject)}
                                className="w-full text-left p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-sky-600 hover:text-white rounded-xl flex justify-between items-center transition-all border border-slate-100 dark:border-slate-700"
                            >
                                <span className="font-black text-slate-900 dark:text-white inherit-color">{subject.name}</span>
                                <ChevronDownIcon className="w-5 h-5 -rotate-90 opacity-40" />
                            </button>
                        ))}
                    </div>
                );
            case 'topic':
                 if (!selectedSubject) return null;
                 return (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {selectedSubject.topics.map(topic => {
                             const isLocked = topic.isPremium && isFreePlan;
                             return (
                                <button
                                    key={topic.id}
                                    onClick={() => handleSelectTopic(topic)}
                                    className={`w-full text-left p-4 rounded-xl flex justify-between items-center transition-all border
                                        ${isLocked 
                                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60 grayscale' 
                                            : 'bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 hover:border-sky-500 shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center">
                                         {isLocked && <LockIcon className="w-4 h-4 text-amber-500 mr-3 flex-shrink-0" />}
                                         <span className={`font-bold ${isLocked ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}>{topic.name}</span>
                                    </div>
                                    {!isLocked && <ChevronDownIcon className="w-4 h-4 -rotate-90 opacity-40" />}
                                </button>
                             );
                        })}
                    </div>
                 );
            case 'difficulty':
                if (!selectedTopic) return null;
                return (
                     <div className="space-y-4">
                        <div className="bg-sky-50 dark:bg-sky-900/30 p-4 rounded-xl mb-6 text-left border border-sky-100 dark:border-sky-800">
                            <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">Tópico</p>
                            <p className="font-black text-slate-900 dark:text-white text-lg leading-tight">{selectedTopic.name}</p>
                        </div>

                        {difficulties.map(level => {
                            const isLocked = (level === 'Difícil' && isFreePlan) || (selectedTopic.isPremium && isFreePlan);
                            return (
                                <button
                                    key={level}
                                    onClick={() => handleSelectDifficulty(level)}
                                    disabled={isLocked}
                                    className={`w-full font-black uppercase tracking-widest py-4 px-4 rounded-2xl text-base transition-all transform active:scale-95 flex items-center justify-center shadow-lg
                                        ${isLocked 
                                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border-slate-300 dark:border-slate-700' 
                                            : 'bg-sky-600 hover:bg-sky-500 text-white hover:-translate-y-1'
                                        }`
                                    }
                                >
                                    {isLocked && <LockIcon className="w-5 h-5 mr-3" />}
                                    {level}
                                </button>
                            );
                        })}
                         {isFreePlan && <p className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-tighter">Nível Difícil é exclusivo Premium ✨</p>}
                    </div>
                );
        }
    };
    
    const getTitle = () => {
        switch (step) {
            case 'subject': return 'Disciplina';
            case 'topic': return 'Tópico';
            case 'difficulty': return 'Dificuldade';
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeInUp"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl p-8 w-full max-w-md text-center transform transition-all flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                     <div className="flex items-center">
                        {step !== 'subject' && !initialTopic && (
                            <button onClick={handleBack} className="mr-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
                            </button>
                        )}
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{getTitle()}</h2>
                     </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <XIcon className="w-6 h-6 text-slate-400" />
                    </button>
                </div>
                
                {renderContent()}

            </div>
            <style>{`.inherit-color { color: inherit; }`}</style>
        </div>
    );
};

export default DifficultyModal;