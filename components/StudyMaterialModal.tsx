import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Topic, Subject } from '../types';
import { generateSmartSearchLinks } from '../constants';
import { generateStudyContent } from '../services/geminiService';
import XIcon from './icons/XIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import PlayIcon from './icons/PlayIcon';
import SparklesIcon from './icons/SparklesIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface StudyMaterialModalProps {
    topic: Topic;
    subject: Subject;
    onClose: () => void;
    onStartQuiz: (topic: Topic) => void;
}

const StudyMaterialModal: React.FC<StudyMaterialModalProps> = ({ topic, subject, onClose, onStartQuiz }) => {
    const [activeTab, setActiveTab] = useState<'links' | 'ai'>('links');
    const [aiContent, setAiContent] = useState<string | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

    // Prioritize topic specific links if they exist, otherwise generate smart links
    // Note: Constants have been updated to remove hardcoded links in favor of the dynamic generator
    const studyLinks = topic.studyLinks || generateSmartSearchLinks(topic.name, subject.name);

    const handleGenerateAiContent = async () => {
        setLoadingAi(true);
        try {
            const content = await generateStudyContent(subject.name, topic.name);
            setAiContent(content);
        } catch (error) {
            console.error(error);
            setAiContent("Desculpe, não conseguimos gerar o resumo agora. Tente novamente mais tarde.");
        } finally {
            setLoadingAi(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeInUp" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{topic.name}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{subject.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <XIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={() => setActiveTab('links')}
                        className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'links' ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        Videoaulas & Links
                    </button>
                    <button 
                        onClick={() => { setActiveTab('ai'); if(!aiContent && !loadingAi) handleGenerateAiContent(); }}
                        className={`flex-1 py-3 text-sm font-medium text-center transition-colors flex items-center justify-center ${activeTab === 'ai' ? 'border-b-2 border-yellow-500 text-yellow-600 dark:text-yellow-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        Resumo Inteligente
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'links' && (
                        <div className="space-y-4">
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                Preparamos uma lista de buscas otimizadas para você encontrar as melhores <strong>videoaulas no YouTube</strong> sobre este assunto.
                            </p>
                            <div className="grid gap-3">
                                {studyLinks.map((link, index) => {
                                    const isVideo = link.url.includes('youtube') || (link as any).type === 'video';
                                    
                                    return (
                                        <a 
                                            key={index}
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={`flex items-center p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors group
                                                ${isVideo 
                                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' 
                                                    : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-full mr-4 ${isVideo ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'}`}>
                                                {isVideo ? <PlayIcon className="w-6 h-6" /> : <BookOpenIcon className="w-6 h-6" />}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-semibold transition-colors ${isVideo ? 'text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400' : 'text-slate-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400'}`}>
                                                    {link.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                                                    {isVideo ? 'Buscar no YouTube' : 'Buscar no Google'}
                                                </p>
                                            </div>
                                            <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="h-full">
                            {loadingAi ? (
                                <div className="flex flex-col items-center justify-center h-48">
                                    <SpinnerIcon className="w-8 h-8 text-yellow-500 mb-3" />
                                    <p className="text-slate-500">A IA está escrevendo seu resumo...</p>
                                </div>
                            ) : aiContent ? (
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: aiContent.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/### (.*?)\n/g, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>') }} />
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p>Clique na aba para gerar.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        Fechar
                    </button>
                    <button 
                        onClick={() => { onClose(); onStartQuiz(topic); }}
                        className="px-6 py-2 bg-primary hover:bg-sky-500 text-white font-bold rounded-lg transition-transform active:scale-95 shadow-md flex items-center"
                    >
                        Praticar Agora <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default StudyMaterialModal;