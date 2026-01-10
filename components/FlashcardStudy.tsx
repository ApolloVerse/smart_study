import React, { useState, useEffect } from 'react';
import { FlashcardDeck } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import RefreshIcon from './icons/RefreshIcon';

interface FlashcardStudyProps {
    deck: FlashcardDeck;
    onExit: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const FlashcardStudy: React.FC<FlashcardStudyProps> = ({ deck, onExit }) => {
    const [shuffledCards, setShuffledCards] = useState(() => shuffleArray(deck.cards));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    
    useEffect(() => {
      // Reseta estado ao mudar o card
      setIsFlipped(false);
    }, [currentIndex]);
    
    const handleNext = () => {
        if (currentIndex < shuffledCards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };
    
    const handleShuffle = () => {
        setShuffledCards(shuffleArray(deck.cards));
        setCurrentIndex(0);
        setIsFlipped(false);
    };
    
    if (shuffledCards.length === 0) {
        return (
            <div className="max-w-md mx-auto text-center bg-white dark:bg-slate-800 p-12 rounded-3xl shadow-xl animate-fadeInUp">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshIcon className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Baralho Vazio</h2>
                <p className="text-slate-500 mt-3 mb-8">Adicione cartões a este baralho para começar a praticar sua memorização.</p>
                <button onClick={onExit} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95">
                    Voltar aos Meus Decks
                </button>
            </div>
        )
    }

    const currentCard = shuffledCards[currentIndex];
    const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

    return (
        <div className="max-w-4xl mx-auto flex flex-col space-y-8 animate-fadeInUp">
             <div className="flex flex-col items-center">
                <button 
                    onClick={onExit} 
                    className="flex items-center text-slate-400 hover:text-sky-500 font-bold mb-6 transition-colors group"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Sair do Modo Estudo
                </button>
                <div className="text-center">
                    <span className="text-xs font-black uppercase text-sky-500 tracking-widest mb-1 block">Estudando Agora</span>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{deck.title}</h1>
                </div>
             </div>
             
             {/* Flashcard Grande */}
             <div className="perspective-1000 w-full aspect-[16/10] sm:h-[400px]">
                <div 
                    className={`relative w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    {/* Front - Pergunta */}
                    <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-12 text-center border-2 border-slate-50 dark:border-slate-700">
                        <span className="absolute top-8 left-8 text-[10px] font-black uppercase tracking-widest text-slate-300">Frente</span>
                        <p className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                            {currentCard.front}
                        </p>
                        <div className="absolute bottom-8 text-sky-500 font-black text-xs uppercase tracking-widest animate-pulse">
                            Toque para ver a resposta
                        </div>
                    </div>

                    {/* Back - Resposta */}
                    <div className="absolute w-full h-full backface-hidden bg-sky-600 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-12 text-center rotate-y-180">
                        <span className="absolute top-8 left-8 text-[10px] font-black uppercase tracking-widest text-sky-200/50">Verso (Resposta)</span>
                        <p className="text-2xl sm:text-3xl font-bold text-white leading-relaxed">
                            {currentCard.back}
                        </p>
                        <div className="absolute bottom-8 text-sky-200 font-black text-xs uppercase tracking-widest">
                            Clique para voltar à pergunta
                        </div>
                    </div>
                </div>
             </div>

             {/* Barra de Progresso e Controles */}
             <div className="w-full space-y-8">
                <div className="flex items-center gap-6">
                    <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className="h-full bg-sky-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="font-black text-slate-500 dark:text-slate-400 tabular-nums">
                        {currentIndex + 1} / {shuffledCards.length}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <button 
                            onClick={handleShuffle} 
                            title="Embaralhar Tudo" 
                            className="p-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-sky-500 shadow-md transition-all active:scale-90"
                        >
                            <RefreshIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handlePrev} 
                            disabled={currentIndex === 0} 
                            className="p-5 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-sky-500 disabled:opacity-30 disabled:pointer-events-none shadow-lg transition-all active:scale-90"
                        >
                            <ArrowLeftIcon className="w-7 h-7" />
                        </button>

                        <button 
                            onClick={handleNext} 
                            disabled={currentIndex === shuffledCards.length - 1} 
                            className="px-10 py-5 rounded-2xl bg-sky-600 text-white font-black shadow-xl hover:bg-sky-500 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 flex items-center"
                        >
                            Próximo Card
                            <ArrowRightIcon className="w-6 h-6 ml-3" />
                        </button>
                    </div>
                </div>
             </div>
             
             <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; }
             `}</style>
        </div>
    );
};

export default FlashcardStudy;