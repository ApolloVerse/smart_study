import React, { useState, useRef } from 'react';
import { User } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import StarIcon from './icons/StarIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import WhatsappIcon from './icons/WhatsappIcon';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface SettingsProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onResetProgress: () => void;
  onScheduleNotification: () => void;
  user: User;
  onNavigate: (page: 'subscription') => void;
  onUpdateUser: (updatedUser: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, onThemeToggle, onResetProgress, user, onNavigate, onUpdateUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => onUpdateUser({ ...user, profilePicture: event.target?.result as string });
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleWhatsappSupport = () => {
    const phoneNumber = '5511961054592'; 
    const message = encodeURIComponent(`Olá! Sou ${user.username} do Smart Study e preciso de suporte.`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeInUp">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Configurações</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Personalize sua experiência e gerencie sua conta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile & Appearance */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-sky-50 dark:bg-sky-900/30 rounded-xl">
                <UserCircleIcon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider">Aparência e Perfil</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700 mb-8">
              <div className="relative group">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Perfil" className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-2xl transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-sky-100 dark:bg-slate-700 flex items-center justify-center text-sky-500 shadow-inner">
                    <UserCircleIcon className="w-16 h-16" />
                  </div>
                )}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2.5 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-500 transition-all active:scale-90 border-2 border-white dark:border-slate-800"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{user.username}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Estudante Smart Study</p>
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-6 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-600 hover:border-sky-500 transition-all text-sm shadow-sm"
                >
                  Alterar Foto de Perfil
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:border-sky-500/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <span className="text-xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">Modo Escuro</span>
                    <span className="text-xs text-slate-400 font-medium">{theme === 'dark' ? 'Ativado' : 'Desativado'}</span>
                  </div>
                </div>
                <button 
                  onClick={onThemeToggle}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 shadow-inner ${theme === 'dark' ? 'bg-sky-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-md ${theme === 'dark' ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Subscription & Help */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl">
                <StarIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider">Assinatura e Ajuda</h2>
            </div>
           
            {/* Improved Subscription Card */}
            <div className="relative p-7 bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 rounded-[2rem] text-white shadow-2xl overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Status da Assinatura</p>
              <div className="flex items-baseline gap-2 mb-6">
                <h3 className="text-4xl font-black capitalize tracking-tight">{user.subscriptionPlan}</h3>
                {user.subscriptionPlan !== 'premium' && <span className="text-xs font-bold opacity-60">Smart Study</span>}
              </div>
              <button 
                onClick={() => onNavigate('subscription')} 
                className="w-full bg-white/95 backdrop-blur-sm text-sky-900 font-black py-4 rounded-2xl hover:bg-white transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
              >
                <SparklesIcon className="w-5 h-5 text-yellow-500" />
                {user.subscriptionPlan === 'premium' ? 'Gerenciar Benefícios' : 'Upgrade para Premium'}
              </button>
            </div>

            <div className="mt-8 space-y-4 flex-grow">
              <button 
                onClick={handleWhatsappSupport} 
                className="w-full flex items-center justify-between p-5 bg-green-50/50 hover:bg-green-50 dark:bg-green-900/10 dark:hover:bg-green-900/20 text-green-700 dark:text-green-400 font-black rounded-2xl border-2 border-green-100/50 dark:border-green-800/30 transition-all active:scale-[0.98] shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-green-500 text-white rounded-xl">
                    <WhatsappIcon className="w-6 h-6" />
                  </div>
                  <span>Suporte via WhatsApp</span>
                </div>
                <ArrowRightIcon className="w-5 h-5 opacity-40" />
              </button>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={onResetProgress} 
                  className="w-full flex items-center justify-center gap-3 p-4 text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all group"
                >
                  <TrashIcon className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                  Redefinir Todos os Dados
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest">Ação irreversível</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;