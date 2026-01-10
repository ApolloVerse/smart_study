import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../types';
import StarIcon from './icons/StarIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import XIcon from './icons/XIcon';
import { 
    FREE_PLAN_SIMULATION_LIMIT,
    FREE_PLAN_ESSAY_LIMIT, 
    FREE_PLAN_ESSAY_ANALYSIS_LIMIT,
    ESSENTIAL_PLAN_ESSAY_ANALYSIS_LIMIT,
    FREE_PLAN_DECK_LIMIT,
    FREE_PLAN_CARD_LIMIT_PER_DECK
} from '../constants';

interface SubscriptionProps {
    user: User;
    onInitiateCheckout: (plan: 'essential' | 'premium') => void;
    onCancelSubscription: () => void;
}

const plans = {
    free: {
        name: 'Plano Gratuito',
        price: 'R$ 0,00',
        description: 'Acesso básico para começar seus estudos.',
        features: [
            'Acesso aos quizzes "Fácil" e "Médio"',
            `${FREE_PLAN_SIMULATION_LIMIT} Simulado Geral (total)`,
            `Até ${FREE_PLAN_ESSAY_LIMIT} redações salvas`,
            `${FREE_PLAN_ESSAY_ANALYSIS_LIMIT} análise de redação com IA (total)`,
            `Até ${FREE_PLAN_DECK_LIMIT} decks de flashcards`,
            `Até ${FREE_PLAN_CARD_LIMIT_PER_DECK} cartões por deck`,
            'Plano de estudo não-editável',
            'Progresso detalhado bloqueado',
        ],
    },
    essential: {
        name: 'Plano Essencial',
        price: 'R$ 9,90',
        description: 'Uso contínuo e mais recursos.',
        features: [
            'Acesso a todos os quizzes (Fácil, Médio, Difícil)',
            'Simulados Gerais ilimitados',
            'Redações ilimitadas',
            `${ESSENTIAL_PLAN_ESSAY_ANALYSIS_LIMIT} análises de redação com IA (total)`,
            'Flashcards ilimitados',
            'Plano de estudo 100% editável',
            'Relatórios Básicos de Progresso',
        ],
    },
    premium: {
        name: 'Plano Premium',
        price: 'R$ 19,90',
        description: 'Experiência completa e otimizada.',
        features: [
            'Todos os benefícios do Essencial',
            'Análises de redação ILIMITADAS',
            'Análise de Desempenho Avançada',
            'Recomendações de Estudo por IA',
            'Suporte Prioritário',
        ],
    }
}

// Modal de Confirmação de Cancelamento
const CancelConfirmationModal: React.FC<{
    onClose: () => void;
    onConfirmCancel: () => void;
    currentPlanName: string;
}> = ({ onClose, onConfirmCancel, currentPlanName }) => {
    return createPortal(
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeInUp" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center text-yellow-500 dark:text-yellow-400">
                        <ExclamationTriangleIcon className="w-8 h-8 mr-3" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cancelar Assinatura?</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <XIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Você está prestes a cancelar seu <strong>{currentPlanName}</strong>. 
                    <br /><br />
                    Ao confirmar, sua conta voltará para o <strong>Plano Gratuito</strong> e você perderá acesso imediato aos recursos premium como simulados ilimitados e correções de redação.
                </p>

                <div className="space-y-3">
                    <button 
                        onClick={onConfirmCancel}
                        className="w-full bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 font-bold py-3 px-4 rounded-lg transition-colors border border-red-200 dark:border-red-800"
                    >
                        Sim, quero voltar ao Gratuito
                    </button>
                    
                    <button 
                        onClick={onClose}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
                    >
                        Não, manter meu plano
                    </button>

                    <button 
                        onClick={onClose}
                        className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        Quero escolher outro plano
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const Subscription: React.FC<SubscriptionProps> = ({ user, onInitiateCheckout, onCancelSubscription }) => {
    const [showCancelModal, setShowCancelModal] = useState(false);

    const handleCancelClick = () => {
        setShowCancelModal(true);
    };

    const confirmCancel = () => {
        setShowCancelModal(false);
        onCancelSubscription();
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center">Nossos Planos</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-center max-w-2xl mx-auto">Escolha o plano que melhor se adapta à sua jornada de estudos. Cancele ou mude de plano a qualquer momento.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {Object.entries(plans).map(([planKey, planData]) => {
                    const key = planKey as keyof typeof plans;
                    const isCurrentPlan = user.subscriptionPlan === key;
                    const isPremium = key === 'premium';
                    
                    return (
                        <div key={key} className={`relative bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg flex flex-col border-2 ${isCurrentPlan ? 'border-sky-500' : 'border-transparent'} ${isPremium ? 'shadow-yellow-500/20' : ''}`}>
                            {isPremium && (
                                <div className="absolute -top-4 right-4 bg-yellow-400 text-slate-900 font-bold px-3 py-1 rounded-full text-sm transform rotate-6 flex items-center">
                                  <StarIcon className="w-4 h-4 mr-1"/>  Mais Popular
                                </div>
                            )}
                            <h2 className={`text-2xl font-bold ${isPremium ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-900 dark:text-white'}`}>{planData.name}</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">{planData.description}</p>
                            
                            <p className="my-8">
                                <span className="text-4xl font-bold text-slate-900 dark:text-white">{planData.price}</span>
                                {key !== 'free' && <span className="text-slate-500 dark:text-slate-400">/mês</span>}
                            </p>

                            <ul className="space-y-3 text-slate-600 dark:text-slate-300 flex-grow">
                                {planData.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            
                            {key !== 'free' && (
                                <button
                                    onClick={() => onInitiateCheckout(key)}
                                    disabled={isCurrentPlan}
                                    className={`mt-8 w-full font-bold py-3 px-4 rounded-lg text-lg transition-all transform active:scale-95 disabled:cursor-not-allowed ${
                                        isCurrentPlan 
                                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' 
                                        : isPremium 
                                        ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-900'
                                        : 'bg-primary hover:bg-sky-500 text-white'
                                    }`}
                                >
                                    {isCurrentPlan ? 'Seu Plano Atual' : `Mudar para ${planData.name.split(' ')[1]}`}
                                </button>
                            )}
                            
                             {isCurrentPlan && key !== 'free' && (
                                <button
                                    onClick={handleCancelClick}
                                    className="mt-4 w-full text-sm font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline"
                                >
                                    Cancelar ou Alterar Assinatura
                                </button>
                             )}
                        </div>
                    );
                })}
            </div>

            {showCancelModal && (
                <CancelConfirmationModal 
                    onClose={() => setShowCancelModal(false)}
                    onConfirmCancel={confirmCancel}
                    currentPlanName={plans[user.subscriptionPlan]?.name || 'Plano'}
                />
            )}
        </div>
    );
};

export default Subscription;