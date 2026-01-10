import React from 'react';
import { User } from '../types';
import LogoIcon from './icons/LogoIcon';
import HomeIcon from './icons/HomeIcon';
import ClipboardCheckIcon from './icons/ClipboardCheckIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import SparklesIcon from './icons/SparklesIcon';

interface WelcomeModalProps {
    user: User;
    onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ user, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeInUp"
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg text-center"
            >
                <div className="flex justify-center -mt-16 mb-4">
                  <LogoIcon className="w-40 h-auto" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    Bem-vindo(a) ao Smart Study, {user.username}!
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8">
                    Estamos felizes em ter você aqui. Descubra como otimizamos sua experiência de estudo:
                </p>

                <div className="space-y-4 text-left">
                    <div className="flex items-start p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        <HomeIcon className="w-7 h-7 text-sky-500 mr-4 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Dashboard</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Sua central de comando para visualizar seu progresso geral e atividades recentes.</p>
                        </div>
                    </div>
                     <div className="flex items-start p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        <ClipboardCheckIcon className="w-7 h-7 text-sky-500 mr-4 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Plano de Estudos</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Siga um cronograma semanal para estudar de forma organizada.</p>
                        </div>
                    </div>
                     <div className="flex items-start p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        <BookOpenIcon className="w-7 h-7 text-sky-500 mr-4 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Disciplinas</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Explore e pratique tópicos específicos com quizzes gerados por IA.</p>
                        </div>
                    </div>
                    <div className="flex items-start p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        <SparklesIcon className="w-7 h-7 text-yellow-500 mr-4 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Geração de Quizzes com IA</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Ao iniciar um quiz, nossa IA gera um conjunto de questões exclusivo para você em tempo real. Cada vez que você joga, recebe novas perguntas para um desafio sempre renovado!</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="mt-8 w-full bg-primary hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105 active:scale-95"
                >
                    Vamos Começar!
                </button>
            </div>
        </div>
    );
};

export default WelcomeModal;