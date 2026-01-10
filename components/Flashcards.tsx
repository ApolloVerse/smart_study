import React, { useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Flashcard, FlashcardDeck, User } from '../types';
import { FREE_PLAN_DECK_LIMIT, FREE_PLAN_CARD_LIMIT_PER_DECK } from '../constants';
import CardsIcon from './icons/CardsIcon';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import StarIcon from './icons/StarIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface FlashcardsProps {
    decks: FlashcardDeck[];
    onSaveDecks: (decks: FlashcardDeck[]) => void;
    onStartStudy: (deck: FlashcardDeck) => void;
    user: User;
}

const DeckFormModal: React.FC<{
    deck?: FlashcardDeck | null;
    onSave: (title: string, description: string) => void;
    onClose: () => void;
}> = ({ deck, onSave, onClose }) => {
    const [title, setTitle] = useState(deck?.title || '');
    const [description, setDescription] = useState(deck?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) onSave(title, description);
    };

    return createPortal(
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 animate-fadeInUp" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">{deck ? 'Editar Deck' : 'Novo Baralho de Estudo'}</h2>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Título do Deck</label>
                        <input type="text" placeholder="Ex: Fórmulas de Física" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Descrição (Opcional)</label>
                        <textarea placeholder="O que este deck cobre?" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl h-28 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancelar</button>
                        <button onClick={handleSubmit} className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl shadow-lg transition-all transform active:scale-95">Salvar Deck</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const CardFormModal: React.FC<{
    card?: Flashcard | null;
    onSave: (front: string, back: string) => void;
    onClose: () => void;
}> = ({ card, onSave, onClose }) => {
    const [front, setFront] = useState(card?.front || '');
    const [back, setBack] = useState(card?.back || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (front.trim() && back.trim()) onSave(front, back);
    };

    return createPortal(
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 animate-fadeInUp" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">{card ? 'Editar Card' : 'Novo Flashcard'}</h2>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Frente (Pergunta/Conceito)</label>
                        <textarea placeholder="Ex: Qual a fórmula da velocidade média?" value={front} onChange={e => setFront(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl h-32 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Verso (Resposta/Definição)</label>
                        <textarea placeholder="Ex: Vm = Δs / Δt" value={back} onChange={e => setBack(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl h-32 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancelar</button>
                        <button onClick={handleSubmit} className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl shadow-lg transition-all transform active:scale-95">Salvar Card</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const Flashcards: React.FC<FlashcardsProps> = ({ decks, onSaveDecks, onStartStudy, user }) => {
    const [isDeckModalOpen, setDeckModalOpen] = useState(false);
    const [isCardModalOpen, setCardModalOpen] = useState(false);
    const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null);
    const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
    const [path, setPath] = useState<{ id: string; title: string }[]>([]);

    const currentParentId = path.length > 0 ? path[path.length - 1].id : null;
    const currentDeck = decks.find(d => d.id === currentParentId);
    const subDecks = decks.filter(d => d.parentId === currentParentId);
    const cards = currentDeck?.cards || [];

    const handleAddDeck = (title: string, description: string) => {
        const newDeck: FlashcardDeck = { id: Date.now().toString(), title, description, cards: [], parentId: currentParentId };
        onSaveDecks([...decks, newDeck]);
        setDeckModalOpen(false);
    };

    const handleEditDeck = (title: string, description: string) => {
        if (!editingDeck) return;
        onSaveDecks(decks.map(d => d.id === editingDeck.id ? { ...d, title, description } : d));
        setDeckModalOpen(false);
        setEditingDeck(null);
    };

    const handleDeleteDeck = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Exclusão direta conforme solicitado
        const idsToDelete = new Set([id]);
        const findChildren = (pid: string) => {
            decks.filter(d => d.parentId === pid).forEach(child => {
                idsToDelete.add(child.id);
                findChildren(child.id);
            });
        };
        findChildren(id);
        
        if (path.some(p => idsToDelete.has(p.id)) || idsToDelete.has(currentParentId || '')) {
            setPath([]);
        }

        onSaveDecks(decks.filter(d => !idsToDelete.has(d.id)));
    };

    const handleSaveCard = (front: string, back: string) => {
        if (!currentDeck) return;
        const updatedCards = editingCard 
            ? cards.map(c => c.id === editingCard.id ? { ...c, front, back } : c)
            : [...cards, { id: Date.now().toString(), front, back }];
        onSaveDecks(decks.map(d => d.id === currentDeck.id ? { ...d, cards: updatedCards } : d));
        setCardModalOpen(false);
        setEditingCard(null);
    };

    const handleDeleteCard = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Exclusão direta conforme solicitado
        const updatedCards = cards.filter(c => c.id !== id);
        onSaveDecks(decks.map(d => d.id === currentDeck!.id ? { ...d, cards: updatedCards } : d));
    };

    return (
        <div className="space-y-8 animate-fadeInUp">
            {/* Header Moderno */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div>
                    <div className="flex items-center text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        <button onClick={() => setPath([])} className="hover:text-sky-500 transition-colors">Meus Baralhos</button>
                        {path.map((p, i) => (
                            <React.Fragment key={p.id}>
                                <ChevronDownIcon className="w-3 h-3 mx-2 -rotate-90 opacity-40" />
                                <button onClick={() => setPath(path.slice(0, i + 1))} className="hover:text-sky-500 transition-colors">{p.title}</button>
                            </React.Fragment>
                        ))}
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                        {currentDeck?.title || 'Memorização Inteligente'}
                    </h1>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    {currentDeck && (
                        <button 
                            onClick={() => onStartStudy(currentDeck)} 
                            className="flex-1 md:flex-none px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center"
                        >
                            Praticar Agora
                        </button>
                    )}
                    <button 
                        onClick={() => { setEditingDeck(null); setDeckModalOpen(true); }} 
                        className="p-4 bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 border-2 border-sky-600/20 dark:border-sky-400/20 rounded-2xl hover:bg-sky-50 dark:hover:bg-slate-600 transition-all shadow-md active:scale-95"
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Listagem de Decks (Sub-decks) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subDecks.map(deck => (
                    <div 
                        key={deck.id} 
                        onClick={() => setPath([...path, { id: deck.id, title: deck.title }])}
                        className="group relative bg-white dark:bg-slate-800 p-7 rounded-3xl shadow-sm hover:shadow-2xl border border-slate-100 dark:border-slate-700 cursor-pointer transition-all transform hover:-translate-y-2 overflow-hidden flex flex-col min-h-[180px]"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-sky-50 dark:bg-sky-900/30 rounded-2xl text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                                <CardsIcon className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingDeck(deck); setDeckModalOpen(true); }} 
                                    className="p-2 text-slate-300 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => handleDeleteDeck(e, deck.id)} 
                                    className="p-2 text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl transition-all shadow-sm"
                                    title="Deletar Deck"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-xl text-slate-800 dark:text-white line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">
                            {deck.title}
                        </h3>
                        <p className="text-sm text-slate-400 mt-2 line-clamp-1 h-5 italic">
                            {deck.description || 'Nenhuma descrição adicionada'}
                        </p>
                        
                        <div className="mt-auto pt-6 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                            <span>{deck.cards.length} Flashcards</span>
                            <span className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">Abrir Baralho &rarr;</span>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    </div>
                ))}

                {/* Card de Adição Rápida */}
                {subDecks.length < FREE_PLAN_DECK_LIMIT || user.subscriptionPlan !== 'free' ? (
                    <button 
                        onClick={() => { setEditingDeck(null); setDeckModalOpen(true); }}
                        className="bg-slate-50 dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 hover:text-sky-500 hover:border-sky-500 transition-all group min-h-[180px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                            <PlusIcon className="w-6 h-6" />
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest">Novo Baralho</span>
                    </button>
                ) : null}
            </div>

            {/* Listagem de Cards Individuais */}
            {currentDeck && (
                <div className="mt-12 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-xl font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                            Cartões neste Deck ({cards.length})
                        </h2>
                        <button 
                            onClick={() => { setEditingCard(null); setCardModalOpen(true); }} 
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl shadow-lg transition-all transform active:scale-95"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Novo Card
                        </button>
                    </div>

                    {cards.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 p-16 rounded-3xl text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-400">Este deck ainda não possui cartões</h3>
                            <p className="text-sm text-slate-400 mt-2">Adicione perguntas e respostas para começar a estudar.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {cards.map(card => (
                                <div key={card.id} className="group relative bg-white dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex-1 w-full min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[10px] font-black uppercase text-sky-500 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded">Frente</span>
                                            <p className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{card.front}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">Verso</span>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 italic line-clamp-1">{card.back}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-auto">
                                        <button 
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingCard(card); setCardModalOpen(true); }} 
                                            className="p-3 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-xl transition-all"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDeleteCard(e, card.id)} 
                                            className="p-3 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl transition-all shadow-sm"
                                            title="Excluir Card"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {isDeckModalOpen && <DeckFormModal deck={editingDeck} onSave={editingDeck ? handleEditDeck : handleAddDeck} onClose={() => setDeckModalOpen(false)} />}
            {isCardModalOpen && <CardFormModal card={editingCard} onSave={handleSaveCard} onClose={() => setCardModalOpen(false)} />}
        </div>
    );
};

export default React.memo(Flashcards);