import React, { useState, useEffect } from 'react';
import { User } from '../types';
import CreditCardIcon from './icons/CreditCardIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface CheckoutProps {
    user: User;
    plan: 'essential' | 'premium';
    onPaymentSuccess: (plan: 'essential' | 'premium') => void;
    onCancel: () => void;
}

const planDetails = {
    essential: { name: 'Plano Essencial', price: 'R$ 9,90/mês' },
    premium: { name: 'Plano Premium', price: 'R$ 19,90/mês' }
};

const Checkout: React.FC<CheckoutProps> = ({ user, plan, onPaymentSuccess, onCancel }) => {
    const [processing, setProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [recipient, setRecipient] = useState('');

    useEffect(() => {
        const savedRecipient = localStorage.getItem('paymentRecipient');
        if (savedRecipient) {
            setRecipient(savedRecipient);
        }
    }, []);

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        // Simula o processamento do pagamento
        setTimeout(() => {
            setProcessing(false);
            setPaymentSuccess(true);
            onPaymentSuccess(plan);
        }, 2500);
    };

    if (paymentSuccess) {
        return (
            <div className="max-w-md mx-auto h-[60vh] flex flex-col items-center justify-center text-center animate-fadeInUp">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20"></div>
                    <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-6 relative z-10" />
                    
                    {/* Partículas de "Confete" */}
                    <div className="absolute -top-4 -left-4 animate-bounce text-2xl">✨</div>
                    <div className="absolute -top-8 right-0 animate-bounce delay-75 text-2xl">🎉</div>
                    <div className="absolute bottom-0 -right-4 animate-bounce delay-150 text-2xl">⭐</div>
                    <div className="absolute bottom-4 -left-8 animate-bounce delay-300 text-2xl">🚀</div>
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-4">Pagamento Confirmado!</h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-medium">
                    Parabéns! Você agora é um membro <span className="text-sky-600 dark:text-sky-400 font-black uppercase">{plan === 'premium' ? 'Premium' : 'Essencial'}</span>.
                </p>
                <p className="text-sm text-slate-400 mt-8 animate-pulse">Redirecionando para seus novos recursos...</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto animate-fadeInUp">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Finalizar Assinatura</h1>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Resumo do Pedido */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-6 flex items-center">
                            <span className="w-8 h-8 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                            Resumo do Plano
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Plano Escolhido:</span>
                                <span className="font-black text-slate-900 dark:text-white text-lg">{planDetails[plan].name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Usuário:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{user.username}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <span className="font-bold text-slate-900 dark:text-white text-xl">Total:</span>
                                <span className="font-black text-sky-600 dark:text-sky-400 text-2xl">{planDetails[plan].price}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                            🔒 Ambiente Seguro. Seus dados estão protegidos por criptografia de ponta a ponta. Esta é uma simulação de pagamento educacional.
                        </p>
                    </div>
                </div>

                {/* Formulário de Pagamento */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-8 flex items-center">
                            <span className="w-8 h-8 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                            Dados de Pagamento
                        </h2>
                        <form onSubmit={handlePayment} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Número do Cartão</label>
                                <div className="relative">
                                    <input type="text" value="4242 4242 4242 4242" disabled className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-lg text-slate-400 cursor-not-allowed" />
                                    <CreditCardIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Validade</label>
                                    <input type="text" value="12/28" disabled className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-400 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">CVC</label>
                                    <input type="text" value="***" disabled className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-400 cursor-not-allowed" />
                                </div>
                            </div>

                            <div className="pt-6 space-y-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-5 rounded-2xl text-xl shadow-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                            Processando...
                                        </>
                                    ) : `Pagar ${planDetails[plan].price}`}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="w-full py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold transition-colors text-sm"
                                >
                                    Escolher outro plano
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;