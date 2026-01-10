import React, { useState, useEffect } from 'react';
import { Page, User } from '../types';
import HomeIcon from './icons/HomeIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import ClipboardCheckIcon from './icons/ClipboardCheckIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import CogIcon from './icons/CogIcon';
import MenuIcon from './icons/MenuIcon';
import XIcon from './icons/XIcon';
import LogoIcon from './icons/LogoIcon';
import StarIcon from './icons/StarIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import CardsIcon from './icons/CardsIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import CloudCheckIcon from './icons/CloudCheckIcon';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
  lastSaved?: Date | null;
}

const NavItem: React.FC<{
  page: Page;
  currentPage: Page;
  onNavClick: (page: Page) => void;
  icon: React.ReactNode;
  label: string;
  isPremium?: boolean;
}> = ({ page, currentPage, onNavClick, icon, label, isPremium = false }) => {
  const isActive = currentPage === page;
  
  const baseClasses = 'flex items-center p-3.5 my-1 w-full text-left rounded-xl transition-all duration-200 font-bold';
  let activeClasses = '';
  let inactiveClasses = '';

  if (isPremium) {
      activeClasses = 'bg-yellow-400 text-slate-900 shadow-lg scale-[1.02]';
      inactiveClasses = 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20';
  } else {
      activeClasses = 'bg-sky-600 text-white shadow-lg scale-[1.02]';
      inactiveClasses = 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-white';
  }

  return (
    <li>
      <button
        onClick={() => onNavClick(page)}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      >
        <span className={`w-6 h-6 ${isActive ? '' : 'opacity-70'}`}>{icon}</span>
        <span className="ml-4 truncate">{label}</span>
      </button>
    </li>
  );
};

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, user, onLogout, lastSaved }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);

  useEffect(() => {
    if (lastSaved) {
        setShowSavedIndicator(true);
        const timer = setTimeout(() => setShowSavedIndicator(false), 3000);
        return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { page: 'dashboard' as Page, icon: <HomeIcon />, label: 'Início' },
    { page: 'subjects' as Page, icon: <BookOpenIcon />, label: 'Disciplinas' },
    { page: 'planner' as Page, icon: <ClipboardCheckIcon />, label: 'Cronograma' },
    { page: 'redacao' as Page, icon: <DocumentTextIcon />, label: 'Redação' },
    { page: 'flashcards' as Page, icon: <CardsIcon />, label: 'Flashcards' },
    { page: 'progress' as Page, icon: <ChartBarIcon />, label: 'Meu Progresso' },
    { page: 'support' as Page, icon: <QuestionMarkCircleIcon />, label: 'Ajuda' },
    { page: 'settings' as Page, icon: <CogIcon />, label: 'Configurações' },
  ];
  
  const premiumNavItem = { page: 'subscription' as Page, icon: <StarIcon />, label: 'Seja Premium', isPremium: true };

  const NavContent = () => (
    <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="flex-1 pr-4">
        <button
          onClick={() => handleNavClick('dashboard')}
          className="flex flex-col items-center mb-10 px-0 group w-full outline-none"
          aria-label="Ir para o dashboard"
        >
          {/* Aumentada a largura máxima para 300px para permitir letras ainda maiores */}
          <LogoIcon className="w-full h-auto max-w-[300px] group-hover:scale-105 transition-transform duration-300 ease-out" />
        </button>
        <nav>
          <ul className="space-y-1">
            {navItems.map(item => (
              <NavItem
                key={item.page}
                page={item.page}
                currentPage={currentPage}
                onNavClick={handleNavClick}
                icon={item.icon}
                label={item.label}
              />
            ))}
            <li className="my-6 border-t border-slate-100 dark:border-slate-700 mx-2"></li>
            <NavItem {...premiumNavItem} currentPage={currentPage} onNavClick={handleNavClick} />
          </ul>
        </nav>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700 pr-4">
         <div className={`mb-4 px-3 flex items-center text-xs font-black uppercase tracking-widest text-green-500 dark:text-green-400 transition-opacity duration-500 ${showSavedIndicator ? 'opacity-100' : 'opacity-0'}`}>
            <CloudCheckIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">Dados Sincronizados</span>
         </div>

        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Perfil" className="w-10 h-10 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-slate-700 flex items-center justify-center text-sky-600 dark:text-slate-400 shadow-sm flex-shrink-0">
                  <UserCircleIcon className="w-7 h-7" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aluno</p>
                <p className="font-bold text-slate-900 dark:text-white truncate" title={user?.username}>{user?.username}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold p-3 rounded-xl transition-all active:scale-95 text-sm"
            >
              Sair da Conta
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-6 z-20 md:hidden">
        <button onClick={() => handleNavClick('dashboard')} className="flex items-center h-full py-2">
          <LogoIcon className="h-full w-auto max-w-[200px]" />
        </button>
         <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl text-slate-600 dark:text-slate-200">
              {isMobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
         </div>
      </div>

      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 transform transition-transform duration-500 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} p-6 overflow-x-hidden`}>
        <NavContent />
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}
    </>
  );
};

export default Header;