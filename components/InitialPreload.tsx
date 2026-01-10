import React from 'react';
import LogoIcon from './icons/LogoIcon';

interface InitialPreloadProps {
    progress: { current: number; total: number; topicName: string };
}

const InitialPreload: React.FC<InitialPreloadProps> = ({ progress }) => {
    const percentage = progress.total > 0
        ? Math.round((progress.current / progress.total) * 100)
        : 0;

    return (
        <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 z-50 transition-colors duration-300">
            <div className="w-full max-w-lg text-center">
                <LogoIcon className="w-48 h-auto mx-auto" />
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-8">Preparando seu Ambiente de Estudos...</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-3 mb-8">
                    Este é um processo único! Estamos gerando com IA um banco completo de questões personalizadas para você. Isso pode levar alguns minutos, mas garantirá uma experiência super rápida depois.
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-sky-400 to-indigo-500 h-4 rounded-full transition-all duration-500 ease-in-out" 
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className="flex justify-between items-center mt-3">
                     <p className="text-sm text-slate-600 dark:text-slate-300 truncate pr-4" title={`Carregando: ${progress.topicName}`}>
                        Carregando: {progress.topicName || 'Iniciando...'}
                    </p>
                    <p className="font-bold text-lg text-slate-800 dark:text-white">{percentage}%</p>
                </div>
            </div>
        </div>
    );
};

export default InitialPreload;