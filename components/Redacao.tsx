import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Essay, User, Progress } from '../types';
import { generateEssayTopic, analyzeEssay } from '../services/geminiService';
import { 
    FREE_PLAN_ESSAY_LIMIT, 
    FREE_PLAN_ESSAY_ANALYSIS_LIMIT,
    ESSENTIAL_PLAN_ESSAY_ANALYSIS_LIMIT
} from '../constants';
import DocumentTextIcon from './icons/DocumentTextIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import SparklesIcon from './icons/SparklesIcon';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import ClockIcon from './icons/ClockIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface RedacaoProps {
    savedEssays: Essay[];
    onSaveEssay: (essay: Essay) => void;
    onNewEssay: (essay: Essay) => void;
    onDeleteEssay: (essayId: string) => void;
    user: User;
    progress: Progress;
    onAnalysisSuccess: () => void;
}

const MIN_CHARS = 400;
const MAX_CHARS = 3500;

const Redacao: React.FC<RedacaoProps> = ({ savedEssays, onSaveEssay, onNewEssay, onDeleteEssay, user, progress, onAnalysisSuccess }) => {
    const [activeEssay, setActiveEssay] = useState<Essay | null>(null);
    const [isLoadingTopic, setIsLoadingTopic] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const autoSaveTimeoutRef = useRef<number | null>(null);
    const isDeletedRef = useRef<boolean>(false);

    const isFreePlan = user.subscriptionPlan === 'free';
    const isEssentialPlan = user.subscriptionPlan === 'essential';

    const essayLimitReached = isFreePlan && savedEssays.length >= FREE_PLAN_ESSAY_LIMIT;
    const analysisLimit = isFreePlan ? FREE_PLAN_ESSAY_ANALYSIS_LIMIT : isEssentialPlan ? ESSENTIAL_PLAN_ESSAY_ANALYSIS_LIMIT : Infinity;
    const analysisCount = progress.essayAnalysisCount || 0;
    const analysisLimitReached = analysisCount >= analysisLimit;

    // Sincroniza flag de exclusão
    useEffect(() => {
        isDeletedRef.current = false;
    }, [activeEssay?.id]);

    // Lógica de auto-salvamento resiliente
    useEffect(() => {
        if (activeEssay && !activeEssay.feedback && !isDeletedRef.current) {
            if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
            setIsAutoSaving(true);
            autoSaveTimeoutRef.current = window.setTimeout(() => {
                if (!isDeletedRef.current && activeEssay) {
                    onSaveEssay(activeEssay);
                }
                setIsAutoSaving(false);
            }, 2000);
        }
        return () => { if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current); };
    }, [activeEssay?.content, activeEssay?.topic, onSaveEssay]);

    const handleGenerateTopic = async () => {
        if (essayLimitReached) {
            setError(`Limite de ${FREE_PLAN_ESSAY_LIMIT} redações atingido no plano gratuito.`);
            return;
        }
        setIsLoadingTopic(true);
        setError(null);
        try {
            const topic = await generateEssayTopic(savedEssays.map(e => e.topic));
            const newEssay: Essay = { 
                id: Date.now().toString(), 
                topic, 
                content: '', 
                createdAt: new Date().toISOString() 
            };
            setActiveEssay(newEssay);
            onNewEssay(newEssay);
        } catch (err: any) { 
            setError(err.message || 'Erro ao gerar tema.'); 
        } finally { 
            setIsLoadingTopic(false); 
        }
    };

    const handleAnalyze = async () => {
        if (!activeEssay) return;
        if (activeEssay.content.length < MIN_CHARS) {
            setError(`Seu texto está muito curto. Escreva pelo menos ${MIN_CHARS} caracteres.`);
            return;
        }
        if (analysisLimitReached) {
            setError('Você atingiu seu limite de análises IA para este plano.');
            return;
        }
        setIsAnalyzing(true);
        setError(null);
        try {
            const { grade, feedback } = await analyzeEssay(activeEssay.topic, activeEssay.content);
            const updatedEssay = { ...activeEssay, grade, feedback };
            setActiveEssay(updatedEssay);
            onSaveEssay(updatedEssay);
            onAnalysisSuccess();
        } catch (err: any) { 
            setError(err.message || 'Erro na análise da IA.'); 
        } finally { 
            setIsAnalyzing(false); 
        }
    };

    const handleDeleteDirect = (e: React.MouseEvent, id: string) => {
        // Interrompe a propagação para não abrir a redação ao clicar no botão de lixeira
        e.stopPropagation();
        e.preventDefault();
        
        // Exclusão imediata sem confirmação conforme pedido pelo usuário
        if (activeEssay?.id === id) {
            isDeletedRef.current = true;
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
                autoSaveTimeoutRef.current = null;
            }
            setActiveEssay(null);
        }
        onDeleteEssay(id);
    };

    const sortedEssays = useMemo(() => 
        [...savedEssays].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [savedEssays]);

    const charPercentage = activeEssay ? Math.min((activeEssay.content.length / MIN_CHARS) * 100, 100) : 0;

    if (activeEssay) {
        return (
            <div className="max-w-5xl mx-auto space-y-6 animate-fadeInUp">
                {/* Header do Editor */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <button 
                        onClick={() => setActiveEssay(null)} 
                        className="flex items-center text-slate-500 hover:text-sky-600 font-medium transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Voltar para a Galeria
                    </button>
                    
                    <div className="flex items-center gap-3">
                        {!activeEssay.feedback && (
                             <div className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full ${isAutoSaving ? 'bg-sky-100 text-sky-600' : 'bg-green-100 text-green-600'}`}>
                                {isAutoSaving ? <SpinnerIcon className="w-3 h-3 mr-2" /> : '✓'}
                                {isAutoSaving ? 'Salvando...' : 'Salvo'}
                            </div>
                        )}
                        <button 
                            onClick={(e) => handleDeleteDirect(e, activeEssay.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Excluir Rascunho"
                        >
                            <TrashIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    {/* Tema */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-sm font-black text-sky-500 uppercase tracking-widest mb-2">Tema da Redação</h2>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                            {activeEssay.topic}
                        </h3>
                    </div>

                    {activeEssay.feedback ? (
                        /* Modo Feedback */
                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-700/50">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Desempenho Geral</p>
                                    <p className={`text-2xl font-black ${activeEssay.grade === 'Boa' ? 'text-green-500' : activeEssay.grade === 'Mediana' ? 'text-amber-500' : 'text-red-500'}`}>
                                        Nota: {activeEssay.grade}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setActiveEssay({...activeEssay, feedback: undefined, grade: undefined})}
                                    className="px-6 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-lg border dark:border-slate-600 shadow-sm hover:bg-slate-50 transition-all"
                                >
                                    Revisar Texto
                                </button>
                            </div>
                            
                            <div className="prose prose-slate dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900/30 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                                <h4 className="text-lg font-bold mb-4 flex items-center">
                                    <SparklesIcon className="w-5 h-5 mr-2 text-yellow-500" />
                                    Feedback da Inteligência Artificial
                                </h4>
                                <div dangerouslySetInnerHTML={{ __html: activeEssay.feedback.replace(/\n/g, '<br/>') }} />
                            </div>
                        </div>
                    ) : (
                        /* Modo Escrita */
                        <div className="p-6 sm:p-8">
                            <textarea
                                value={activeEssay.content}
                                onChange={(e) => setActiveEssay({ ...activeEssay, content: e.target.value })}
                                placeholder="Comece seu texto aqui... Lembre-se de seguir a estrutura dissertativa-argumentativa."
                                className="w-full h-[500px] p-0 bg-transparent border-none focus:ring-0 text-lg leading-relaxed text-slate-800 dark:text-slate-100 resize-none font-serif"
                                disabled={isAnalyzing}
                            />
                            
                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="w-full sm:w-64">
                                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tighter">
                                        <span className={activeEssay.content.length >= MIN_CHARS ? 'text-green-500' : 'text-slate-400'}>
                                            {activeEssay.content.length} caracteres
                                        </span>
                                        <span className="text-slate-400">Mínimo: {MIN_CHARS}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${activeEssay.content.length >= MIN_CHARS ? 'bg-green-500' : 'bg-sky-500'}`}
                                            style={{ width: `${charPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || activeEssay.content.length < MIN_CHARS || analysisLimitReached}
                                    className="w-full sm:w-auto px-10 py-4 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isAnalyzing ? (
                                        <><SpinnerIcon className="w-5 h-5 mr-3" /> Analisando...</>
                                    ) : (
                                        <><SparklesIcon className="w-5 h-5 mr-3" /> Finalizar e Analisar</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {error && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold text-center border border-red-200 dark:border-red-900/50">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fadeInUp">
            {/* Header Galeria */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="max-w-xl">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Laboratório de Redação</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Pratique sua escrita com temas inéditos e receba correções instantâneas baseadas nos critérios oficiais da ETEC.
                    </p>
                </div>
                <button 
                    onClick={handleGenerateTopic} 
                    disabled={isLoadingTopic || essayLimitReached}
                    className="w-full md:w-auto px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center disabled:opacity-50"
                >
                    {isLoadingTopic ? <SpinnerIcon className="w-6 h-6 mr-3" /> : <PlusIcon className="w-6 h-6 mr-3" />}
                    Novo Tema IA
                </button>
            </div>

            {/* Listagem de Redações */}
            {sortedEssays.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-20 rounded-3xl text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <DocumentTextIcon className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Sua galeria está vazia</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                        Inicie um novo desafio para começar a treinar sua escrita e ver seu progresso aqui.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedEssays.map(essay => (
                        <div 
                            key={essay.id} 
                            onClick={() => setActiveEssay(essay)}
                            className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-2xl border border-slate-100 dark:border-slate-700 p-6 cursor-pointer transition-all transform hover:-translate-y-2 overflow-hidden"
                        >
                            {/* Badges */}
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest ${essay.feedback ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'}`}>
                                    {essay.feedback ? 'Finalizada' : 'Em Rascunho'}
                                </span>
                                {/* Botão de exclusão sempre visível em mobile, visível no hover em desktop */}
                                <button 
                                    onClick={(e) => handleDeleteDirect(e, essay.id)}
                                    className="p-3 text-red-500 bg-red-50 dark:bg-red-900/30 rounded-full transition-all z-20 hover:bg-red-500 hover:text-white shadow-sm opacity-100 sm:opacity-0 group-hover:opacity-100"
                                    title="Excluir Permanentemente"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Título */}
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight h-12 mb-6 group-hover:text-sky-500 transition-colors">
                                {essay.topic}
                            </h3>

                            {/* Footer do Card */}
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-700">
                                <div className="flex items-center text-xs text-slate-400 font-bold">
                                    <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
                                    {new Date(essay.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                                {essay.grade && (
                                    <div className={`text-xs font-black uppercase tracking-widest ${essay.grade === 'Boa' ? 'text-green-500' : essay.grade === 'Mediana' ? 'text-amber-500' : 'text-red-500'}`}>
                                        {essay.grade}
                                    </div>
                                )}
                            </div>

                            {/* Hover bar */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default React.memo(Redacao);