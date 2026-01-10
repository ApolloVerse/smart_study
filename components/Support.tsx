import React, { useState, useEffect } from 'react';
import { User } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';
import WhatsappIcon from './icons/WhatsappIcon';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';

interface SupportProps {
  user: User;
}

const FAQ_DATA = [
  {
    question: "Como funciona a geração de quizzes com IA?",
    answer: "Nossos quizzes são criados em tempo real pela IA do Google (Gemini) sempre que você inicia um. Isso garante que você nunca receba as mesmas perguntas repetidas, tornando seu estudo mais dinâmico. A IA segue o estilo do vestibulinho da ETEC para criar questões relevantes."
  },
  {
    question: "Posso editar meu plano de estudos?",
    answer: "A edição do plano de estudos é um recurso exclusivo para assinantes dos planos Essencial e Premium. No plano gratuito, você pode seguir nosso plano recomendado, que foi projetado para cobrir todas as matérias de forma equilibrada."
  },
  {
    question: "Como funciona o cancelamento da assinatura?",
    answer: "Você pode cancelar sua assinatura a qualquer momento na tela de 'Configurações' > 'Plano de Assinatura'. Ao cancelar, você manterá o acesso aos recursos do seu plano até o final do período de faturamento atual."
  },
  {
    question: "Meu progresso é salvo?",
    answer: "Sim! Todo o seu progresso, incluindo histórico de quizzes, redações e flashcards, é salvo automaticamente no seu dispositivo, associado à sua conta."
  }
];

const Support: React.FC<SupportProps> = ({ user }) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  
  const handleWhatsappSupport = () => {
    const phoneNumber = '5511961054592'; 
    const message = encodeURIComponent(`Olá! Sou ${user.username} do app Smart Study e preciso de ajuda.`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center">Central de Ajuda</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-center">Encontre respostas para suas dúvidas ou entre em contato conosco.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold text-sky-500 dark:text-sky-400 mb-6 flex items-center">
            <QuestionMarkCircleIcon className="w-7 h-7 mr-3" />
            Perguntas Frequentes
        </h2>
        <div className="space-y-4">
          {FAQ_DATA.map((item, index) => (
            <div key={index} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 pb-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left py-2"
                aria-expanded={openFAQ === index}
              >
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{item.question}</h3>
                <ChevronDownIcon 
                  className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${openFAQ === index ? 'rotate-180' : ''}`} 
                />
              </button>
              {openFAQ === index && (
                <div className="mt-2 text-slate-600 dark:text-slate-300 animate-fadeInUp pr-6">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
       <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold text-sky-500 dark:text-sky-400 mb-4">Ainda precisa de ajuda?</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Se não encontrou sua resposta no FAQ, entre em contato diretamente com nossa equipe de suporte.</p>
        
        <button 
            onClick={handleWhatsappSupport}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center transition-transform active:scale-95 text-lg"
        >
            <WhatsappIcon className="w-7 h-7 mr-3" />
            Contatar Suporte via WhatsApp
        </button>
      </div>
    </div>
  );
};

export default Support;