import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Page, Topic, Progress, StudyDay, User, NotificationSettings, FlashcardDeck, Essay, Flashcard, QuizState } from './types';
import { INITIAL_PROGRESS, STUDY_PLAN_DATA } from './constants';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Subjects from './components/Subjects';
import Quiz from './components/Quiz';
import StudyPlanner from './components/StudyPlanner';
import ProgressTracker from './components/ProgressTracker';
import Settings from './components/Settings';
import Auth from './components/Auth';
import Subscription from './components/Subscription';
import DifficultyModal from './components/DifficultyModal';
import Checkout from './components/Checkout';
import WelcomeModal from './components/WelcomeModal';
import Flashcards from './components/Flashcards';
import FlashcardStudy from './components/FlashcardStudy';
import Redacao from './components/Redacao';
import Support from './components/Support';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [progress, setProgress] = useState<Progress>(INITIAL_PROGRESS);
  const [studyPlan, setStudyPlan] = useState<StudyDay[]>(STUDY_PLAN_DATA);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [planToPurchase, setPlanToPurchase] = useState<'essential' | 'premium' | null>(null);
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // --- GERENCIAMENTO DE TEMA ---
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    if (currentUser) {
      const username = currentUser.username;
      const savedProgress = localStorage.getItem(`progress_${username}`);
      if (savedProgress) setProgress(JSON.parse(savedProgress));
      const savedPlan = localStorage.getItem(`studyPlan_${username}`);
      if (savedPlan) setStudyPlan(JSON.parse(savedPlan));
      const savedFlashcards = localStorage.getItem(`flashcards_${username}`);
      if (savedFlashcards) setFlashcardDecks(JSON.parse(savedFlashcards));
      const savedEssays = localStorage.getItem(`essays_${username}`);
      if (savedEssays) setEssays(JSON.parse(savedEssays));
      setIsDataLoaded(true);
    } else {
      setIsDataLoaded(false);
    }
  }, [currentUser]);

  // --- PERSISTÊNCIA AUTOMÁTICA ---
  useEffect(() => {
    if (currentUser && isDataLoaded) {
        const username = currentUser.username;
        localStorage.setItem(`progress_${username}`, JSON.stringify(progress));
        localStorage.setItem(`studyPlan_${username}`, JSON.stringify(studyPlan));
        localStorage.setItem(`flashcards_${username}`, JSON.stringify(flashcardDecks));
        localStorage.setItem(`essays_${username}`, JSON.stringify(essays));
        setLastSaved(new Date());
    }
  }, [progress, studyPlan, flashcardDecks, essays, currentUser, isDataLoaded]);

  const handleNavigate = useCallback((page: Page) => {
    window.location.hash = page;
    setCurrentPage(page);
  }, []);

  const handleLogin = useCallback((user: User) => {
    setIsDataLoaded(false);
    setCurrentUser(user);
    handleNavigate('dashboard');
  }, [handleNavigate]);

  const handleLogout = () => {
    setIsDataLoaded(false);
    setCurrentUser(null);
    setProgress(INITIAL_PROGRESS);
    setFlashcardDecks([]);
    setEssays([]);
    localStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('loggedInUser');
    handleNavigate('dashboard');
  };

  const handlePaymentSuccess = (plan: 'essential' | 'premium') => {
    if (!currentUser) return;
    
    const updatedUser: User = { ...currentUser, subscriptionPlan: plan };
    setCurrentUser(updatedUser);
    
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => u.username === updatedUser.username ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setTimeout(() => handleNavigate('dashboard'), 2000);
  };

  const handleCancelSubscription = () => {
    if (!currentUser) return;
    const updatedUser: User = { ...currentUser, subscriptionPlan: 'free' };
    setCurrentUser(updatedUser);
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => u.username === updatedUser.username ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard progress={progress} onStartQuiz={(t) => { if(t) setActiveTopic(t); handleNavigate('quiz'); }} onResumeQuiz={(q) => { setActiveTopic(q.topic); handleNavigate('quiz'); }} user={currentUser!} />;
      case 'subjects': return <Subjects onStartQuiz={(t) => { setActiveTopic(t); handleNavigate('quiz'); }} user={currentUser!} />;
      case 'planner': return <StudyPlanner studyPlan={studyPlan} onUpdatePlan={setStudyPlan} onStartQuiz={(t) => { setActiveTopic(t); handleNavigate('quiz'); }} completedTasks={progress.completedTasks} onToggleTask={(id) => setProgress(p => ({...p, completedTasks: p.completedTasks.includes(id) ? p.completedTasks.filter(x => x !== id) : [...p.completedTasks, id]}))} user={currentUser!} />;
      case 'progress': return <ProgressTracker progress={progress} user={currentUser!} onNavigate={handleNavigate} />;
      case 'settings': return <Settings theme={theme} onThemeToggle={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} onResetProgress={() => setProgress(INITIAL_PROGRESS)} onScheduleNotification={() => {}} user={currentUser!} onNavigate={handleNavigate} onUpdateUser={setCurrentUser} />;
      case 'flashcards': return <Flashcards decks={flashcardDecks} onSaveDecks={setFlashcardDecks} onStartStudy={(d) => { setActiveDeck(d); handleNavigate('flashcard-study'); }} user={currentUser!} />;
      case 'flashcard-study': return activeDeck ? <FlashcardStudy deck={activeDeck} onExit={() => handleNavigate('flashcards')} /> : null;
      case 'redacao': return <Redacao savedEssays={essays} onSaveEssay={(e) => setEssays(prev => prev.map(item => item.id === e.id ? e : item))} onNewEssay={(e) => setEssays(prev => [e, ...prev])} onDeleteEssay={(id) => setEssays(prev => prev.filter(e => e.id !== id))} user={currentUser!} progress={progress} onAnalysisSuccess={() => setProgress(p => ({...p, essayAnalysisCount: p.essayAnalysisCount + 1}))} />;
      case 'quiz': return activeTopic ? <Quiz topic={activeTopic} difficulty="Médio" onQuizComplete={() => handleNavigate('dashboard')} user={currentUser!} /> : null;
      case 'support': return <Support user={currentUser!} />;
      case 'subscription': return <Subscription user={currentUser!} onInitiateCheckout={(plan) => { setPlanToPurchase(plan); handleNavigate('checkout'); }} onCancelSubscription={handleCancelSubscription} />;
      case 'checkout': return planToPurchase ? <Checkout user={currentUser!} plan={planToPurchase} onPaymentSuccess={handlePaymentSuccess} onCancel={() => handleNavigate('subscription')} /> : null;
      default: return <Dashboard progress={progress} onStartQuiz={() => {}} onResumeQuiz={() => {}} user={currentUser!} />;
    }
  };

  if (!currentUser) return <Auth onLoginSuccess={handleLogin} />;

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      <div className="flex flex-col md:flex-row">
        <Header currentPage={currentPage} setCurrentPage={handleNavigate} user={currentUser} onLogout={handleLogout} lastSaved={lastSaved} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 md:ml-64 pt-20 md:pt-6 animate-fadeInUp">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;