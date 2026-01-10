import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../types';
import { INITIAL_PROGRESS } from '../constants';
import LogoIcon from './icons/LogoIcon';

interface AuthProps {
    onLoginSuccess: (user: User, isNewUser: boolean) => void;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 5;
const LOCKOUT_DURATION_MS = LOCKOUT_DURATION_MINUTES * 60 * 1000;

interface LoginAttemptData {
    [username: string]: {
        count: number;
        lockoutUntil: number | null;
    };
}

const checkPasswordStrength = (password: string) => {
    const hasMinLength = password.length >= 5;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    return {
        hasMinLength,
        hasUppercase,
        hasLowercase,
        hasNumber,
        hasSpecialChar,
    };
};

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [lockoutTime, setLockoutTime] = useState(0);

    const passwordCriteria = useMemo(() => checkPasswordStrength(password), [password]);

    // Check for existing lockout on username change
    useEffect(() => {
        if (!username) return;
        const attempts: LoginAttemptData = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        const userAttempts = attempts[username.toLowerCase()];

        if (userAttempts?.lockoutUntil && userAttempts.lockoutUntil > Date.now()) {
            const remainingTime = Math.ceil((userAttempts.lockoutUntil - Date.now()) / 1000);
            setLockoutTime(remainingTime);
        } else {
            setLockoutTime(0);
        }
    }, [username]);

    // Countdown timer effect
    useEffect(() => {
        if (lockoutTime > 0) {
            const timer = setTimeout(() => {
                setLockoutTime(lockoutTime - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [lockoutTime]);
    
    const handleLoginSuccess = (user: User, isNewUser: boolean) => {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('loggedInUser', user.username);

        // Clear login attempts on success
        const attempts: LoginAttemptData = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        delete attempts[user.username.toLowerCase()];
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));

        onLoginSuccess(user, isNewUser);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const cleanUsername = username.trim();
        const lowerCaseUsername = cleanUsername.toLowerCase();
        
        if (lockoutTime > 0) {
            const minutes = Math.floor(lockoutTime / 60);
            const seconds = lockoutTime % 60;
            setError(`Conta bloqueada. Tente novamente em ${minutes}m ${seconds}s.`);
            return;
        }

        if (cleanUsername.length < 3) {
            setError('O nome de usuário deve ter no mínimo 3 caracteres.');
            return;
        }

        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const attempts: LoginAttemptData = JSON.parse(localStorage.getItem('loginAttempts') || '{}');

        if (isLogin) {
            const user = users.find(u => u.username.toLowerCase() === lowerCaseUsername);
            if (user && user.password === password) {
                handleLoginSuccess(user, false);
            } else {
                const userAttempts = attempts[lowerCaseUsername] || { count: 0, lockoutUntil: null };
                const newCount = userAttempts.count + 1;
                
                if (newCount >= MAX_LOGIN_ATTEMPTS) {
                    userAttempts.count = 0;
                    userAttempts.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
                    setLockoutTime(Math.ceil(LOCKOUT_DURATION_MS / 1000));
                    setError(`Conta bloqueada por ${LOCKOUT_DURATION_MINUTES} minutos devido ao excesso de tentativas.`);
                } else {
                    userAttempts.count = newCount;
                    setError(`Usuário ou senha inválidos. (${newCount}/${MAX_LOGIN_ATTEMPTS} tentativas).`);
                }
                attempts[lowerCaseUsername] = userAttempts;
                localStorage.setItem('loginAttempts', JSON.stringify(attempts));
            }
        } else { // Registration logic
            const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

            if (!isPasswordValid) {
                setError('A senha não atende a todos os requisitos de segurança.');
                return;
            }

            const existingUser = users.find(u => u.username.toLowerCase() === lowerCaseUsername);
            if (existingUser) {
                setError('Nome de usuário já cadastrado.');
            } else {
                const newUser: User = { 
                  username: cleanUsername, 
                  password,
                  subscriptionPlan: 'free',
                };
                const updatedUsers = [...users, newUser];
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                localStorage.setItem(`progress_${newUser.username}`, JSON.stringify(INITIAL_PROGRESS));
                handleLoginSuccess(newUser, true);
            }
        }
    };
    
    const PasswordCriteriaIndicator: React.FC<{ criteria: { [key: string]: boolean }, label: string, criteriaKey: keyof typeof passwordCriteria }> = ({ criteria, label, criteriaKey }) => (
      <li className={`transition-colors duration-300 ${criteria[criteriaKey] ? 'text-green-500' : 'text-slate-500 dark:text-slate-400'}`}>
        {criteria[criteriaKey] ? '✓' : '•'} {label}
      </li>
    );

    const isLocked = lockoutTime > 0;
    const lockoutMessage = `Conta bloqueada. Tente novamente em ${Math.floor(lockoutTime / 60)}m ${lockoutTime % 60}s.`;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 font-['Inter',_sans_serif] p-4">
            <div className="w-full max-w-md">
                 <div className="flex flex-col items-center justify-center mb-8">
                     <LogoIcon className="w-32 h-auto" />
                 </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-2">{isLogin ? 'Login' : 'Cadastro'}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-center mb-8">{isLogin ? 'Acesse sua conta para continuar' : 'Crie uma conta para salvar seu progresso'}</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2" htmlFor="username">Nome de Usuário</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={`w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 focus:outline-none ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                required
                                disabled={isLocked}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2" htmlFor="password">Senha</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 focus:outline-none ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                required
                                disabled={isLocked}
                            />
                        </div>
                        
                        {isLogin && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className={`h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer dark:bg-slate-900 dark:border-slate-600 dark:checked:bg-sky-500 ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                        disabled={isLocked}
                                    />
                                    <label htmlFor="remember-me" className={`ml-2 block text-sm text-slate-700 dark:text-slate-300 ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                        Manter conectado
                                    </label>
                                </div>
                            </div>
                        )}

                        {!isLogin && (
                            <div className="text-sm">
                                <ul className="space-y-1 pl-1">
                                    <PasswordCriteriaIndicator criteria={passwordCriteria} label="Pelo menos 5 caracteres" criteriaKey="hasMinLength" />
                                    <PasswordCriteriaIndicator criteria={passwordCriteria} label="Uma letra maiúscula (A-Z)" criteriaKey="hasUppercase" />
                                    <PasswordCriteriaIndicator criteria={passwordCriteria} label="Uma letra minúscula (a-z)" criteriaKey="hasLowercase" />
                                    <PasswordCriteriaIndicator criteria={passwordCriteria} label="Um número (0-9)" criteriaKey="hasNumber" />
                                    <PasswordCriteriaIndicator criteria={passwordCriteria} label="Um caractere especial (!@#$...)" criteriaKey="hasSpecialChar" />
                                </ul>
                            </div>
                        )}

                        {(error || isLocked) && <p className="text-red-500 dark:text-red-400 text-sm text-center">{isLocked ? lockoutMessage : error}</p>}
                        
                        <button type="submit" className={`w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:bg-sky-500 transform hover:scale-105 active:scale-95'}`} disabled={isLocked}>
                            {isLogin ? 'Entrar' : 'Criar Conta'}
                        </button>
                    </form>
                    <p className="text-center text-slate-500 dark:text-slate-400 mt-6">
                        {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); setPassword(''); }} className="font-semibold text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 ml-2">
                            {isLogin ? 'Cadastre-se' : 'Faça Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;