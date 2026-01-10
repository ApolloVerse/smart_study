import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Topic, Question, QuizState, User } from '../types';
import { generateQuiz, generateGeneralSimulation } from '../services/geminiService';
import { getSubjectById, SIMULATION_DURATION_MINUTES } from '../constants';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import ClockIcon from './icons/ClockIcon';

interface QuizProps {
  topic: Topic;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  onQuizComplete: (topicId: string, subjectId: string, score: number, correctAnswers: number, totalQuestions: number) => void;
  initialState?: QuizState | null;
  user: User;
}

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


const Quiz: React.FC<QuizProps> = ({ topic, difficulty, onQuizComplete, initialState, user }) => {
  const [questions, setQuestions] = useState<Question[]>(initialState?.questions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialState?.currentQuestionIndex || 0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>(initialState?.userAnswers || []);
  const [loading, setLoading] = useState(!initialState);
  const [error, setError] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [patienceMessage, setPatienceMessage] = useState('');
  const [retryAfter, setRetryAfter] = useState(0); 
  const [finalScore, setFinalScore] = useState<{ score: number; correct: number; total: number } | null>(null);
  const timersRef = useRef<number[]>([]);

  const isSimulation = topic.id === 'simulado-geral';
  const [timeLeft, setTimeLeft] = useState<number>(initialState?.timeLeft || SIMULATION_DURATION_MINUTES * 60);
  const [timeUp, setTimeUp] = useState(false);
  const timerRef = useRef<number | null>(null);
  
  // Persist state to localStorage on changes
  useEffect(() => {
    if (!quizFinished && questions.length > 0) {
        const state: QuizState = {
            topic,
            questions,
            currentQuestionIndex,
            userAnswers,
            difficulty,
            lastUpdated: new Date().toISOString(),
            timeLeft: isSimulation ? timeLeft : undefined
        };
        
        // Load existing saved quizzes map
        const storageKey = `saved_quizzes_${user.username}`;
        const existingData = localStorage.getItem(storageKey);
        let savedQuizzes: Record<string, QuizState> = {};
        
        if (existingData) {
            try {
                savedQuizzes = JSON.parse(existingData);
            } catch (e) {
                console.error("Error parsing saved quizzes", e);
            }
        }

        // Update specific topic entry
        savedQuizzes[topic.id] = state;
        
        localStorage.setItem(storageKey, JSON.stringify(savedQuizzes));
    }
  }, [questions, currentQuestionIndex, userAnswers, topic, difficulty, user.username, quizFinished, isSimulation, timeLeft]);


  const handleFinishQuiz = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setQuizFinished(true);
    
    // Remove ONLY this quiz from the saved list
    const storageKey = `saved_quizzes_${user.username}`;
    const existingData = localStorage.getItem(storageKey);
    if (existingData) {
        try {
            const savedQuizzes = JSON.parse(existingData);
            if (savedQuizzes[topic.id]) {
                delete savedQuizzes[topic.id];
                localStorage.setItem(storageKey, JSON.stringify(savedQuizzes));
            }
        } catch (e) {
            console.error("Error cleaning up saved quiz", e);
        }
    }
  }, [user.username, topic.id]);
  
  useEffect(() => {
    // This effect calculates the score once the quiz is marked as finished.
    // It's guarded by `finalScore === null` to prevent recalculations.
    if (quizFinished && finalScore === null) {
      const correctAnswersCount = userAnswers.reduce((acc, answer, index) => {
        if (questions[index] && answer === questions[index].correctAnswer) {
          return acc + 1;
        }
        return acc;
      }, 0);

      const totalQuestions = questions.length;
      const scorePercentage = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

      setFinalScore({
        score: scorePercentage,
        correct: correctAnswersCount,
        total: totalQuestions,
      });
    }
  }, [quizFinished, userAnswers, questions, finalScore]);


  useEffect(() => {
    if (retryAfter > 0) {
      const timer = setTimeout(() => setRetryAfter(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [retryAfter]);

  useEffect(() => {
    // This effect manages the simulation timer.
    if (!isSimulation || loading || quizFinished) {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return;
    }

    if (!timerRef.current) {
        timerRef.current = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setTimeUp(true);
                    handleFinishQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    return () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };
  }, [isSimulation, loading, quizFinished, handleFinishQuiz]);

  const loadQuestions = useCallback(async () => {
    if (initialState) return; // Do not load if restoring state

    setLoading(true);
    setError(null);
    setRetryAfter(0); // Reset on new attempt
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizFinished(false);
    setFinalScore(null);
    setTimeUp(false);
    setTimeLeft(SIMULATION_DURATION_MINUTES * 60);

    try {
      const subject = getSubjectById(topic.subjectId);
      const { questions: fetchedQuestions } = isSimulation 
        ? await generateGeneralSimulation()
        : await generateQuiz(subject?.name || '', topic.name, topic.id, difficulty);
      
      const shuffledQuestions = fetchedQuestions.map(q => ({
          ...q,
          options: shuffleArray(q.options)
      }));

      setQuestions(shuffledQuestions);
      setUserAnswers(new Array(shuffledQuestions.length).fill(null));

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load quiz';
      setError(errorMessage);
      if (errorMessage.includes('Atingimos o limite de solicitações à IA')) {
        setRetryAfter(30); // Start a 30-second countdown for rate limit errors
      }
    } finally {
      setLoading(false);
    }
  }, [topic.id, topic.name, topic.subjectId, difficulty, isSimulation, initialState]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

    useEffect(() => {
    const clearTimers = () => {
        timersRef.current.forEach(t => {
            clearTimeout(t);
            clearInterval(t);
        });
        timersRef.current = [];
    };

    if (loading) {
        setPatienceMessage(''); // Reset on new load

        const initialTimer = window.setTimeout(() => {
            const messages = [
                "Aguarde, já estamos quase terminando...",
                "Nossa IA está caprichando nas perguntas.",
                "Obrigado pela paciência, estamos quase lá!",
                "Só mais um momento...",
            ];
            let messageIndex = 0;
            
            setPatienceMessage(messages[messageIndex]); // Show first message

            const intervalTimer = window.setInterval(() => {
                messageIndex = (messageIndex + 1) % messages.length;
                setPatienceMessage(messages[messageIndex]);
            }, 15000); // Cycle every 15 seconds

            timersRef.current.push(intervalTimer);

        }, 30000); // After 30 seconds

        timersRef.current.push(initialTimer);

    } else {
        clearTimers();
        setPatienceMessage('');
    }

    return clearTimers;
  }, [loading]);

  const handleAnswerSelect = (option: string) => {
    if (quizFinished) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = option;
    setUserAnswers(newAnswers);
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleExitQuiz = () => {
    if (finalScore) {
      onQuizComplete(topic.id, topic.subjectId, finalScore.score, finalScore.correct, finalScore.total);
    } else {
      // Fallback for premature exit (e.g., error screen)
      onQuizComplete(topic.id, topic.subjectId, 0, 0, questions.length);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 max-w-lg mx-auto text-center">
        <p className="text-xl font-semibold text-slate-900 dark:text-white">Gerando seu {isSimulation ? 'simulado' : 'quiz'} com IA...</p>
        <p className="text-slate-500 dark:text-slate-400 my-4">
            Aguarde um momento, estamos preparando as melhores perguntas para você.
        </p>
        <div className="w-full max-w-sm bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div className="relative h-full w-full">
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-sky-400 to-indigo-500 animate-shimmer"></div>
          </div>
        </div>
        {patienceMessage && (
          <p key={patienceMessage} className="mt-6 text-slate-600 dark:text-slate-300 font-medium animate-fadeInUp">
            {patienceMessage}
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-6 rounded-lg max-w-lg mx-auto">
        <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Ocorreu um Erro</h2>
        <p className="mt-2 mb-6">
          {error}
        </p>
        <button
          onClick={loadQuestions}
          disabled={retryAfter > 0}
          className="bg-primary hover:bg-sky-500 text-white font-bold py-2 px-6 rounded transition-all transform hover:scale-105 active:scale-95 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
        >
          {retryAfter > 0 ? `Tentar Novamente em ${retryAfter}s` : 'Tentar Novamente'}
        </button>
      </div>
    );
  }

  if (questions.length === 0 && !loading) {
    return (
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quiz Não Encontrado</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Não foi possível gerar perguntas para este tópico no momento.</p>
            <button onClick={handleExitQuiz} className="mt-6 bg-primary hover:bg-sky-500 text-white font-bold py-2 px-4 rounded transition-transform transform hover:scale-105 active:scale-95">Voltar ao Dashboard</button>
        </div>
    );
  }
  
  if (quizFinished && finalScore) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  {isSimulation ? 'Simulado Finalizado!' : 'Quiz Finalizado!'}
                </h2>
                 {isSimulation && timeUp && (
                    <p className="text-lg text-red-500 dark:text-red-400 font-semibold mb-4">O tempo acabou!</p>
                )}
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-2">Seu resultado para "{topic.name}":</p>
                <p className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 mb-6">{finalScore.score.toFixed(0)}%</p>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Você acertou {finalScore.correct} de {finalScore.total} perguntas.</p>
                <button onClick={handleExitQuiz} className="bg-primary hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 active:scale-95">
                    Voltar ao Dashboard
                </button>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Revisão das Perguntas</h3>
                {questions.map((question, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = userAnswer === question.correctAnswer;
                    
                    return (
                        <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
                            <div className="flex items-start">
                                <span className={`mr-4 font-bold text-lg ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>{index + 1}.</span>
                                <p className="flex-1 font-semibold text-slate-800 dark:text-white">{question.question}</p>
                            </div>
                            
                            <div className="mt-4 space-y-2 pl-8">
                                {question.options.map((option, optIndex) => {
                                    const isUserAnswer = option === userAnswer;
                                    const isCorrectAnswer = option === question.correctAnswer;
                                    let optionStyle = 'border-slate-300 dark:border-slate-600';
                                    let indicator = null;

                                    if (isCorrectAnswer) {
                                        optionStyle = 'border-green-500 bg-green-50 dark:bg-green-900/30';
                                        indicator = <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />;
                                    }
                                    if (isUserAnswer && !isCorrectAnswer) {
                                        optionStyle = 'border-red-500 bg-red-50 dark:bg-red-900/30';
                                        indicator = <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />;
                                    } else if (isUserAnswer) {
                                        // This is for when the user's answer is correct
                                        indicator = <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />;
                                    }

                                    return (
                                        <div 
                                            key={optIndex} 
                                            className={`flex items-center p-3 border rounded-md ${optionStyle}`}
                                        >
                                            <span className="flex-1 text-slate-700 dark:text-slate-200">{option}</span>
                                            {indicator}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-900/50 pl-8">
                                <p className="text-slate-600 dark:text-slate-300">
                                    <span className="font-semibold">Explicação:</span> {question.explanation}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  }

  // Quiz rendering logic for active state
  const question = questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{isSimulation ? 'Simulado Geral' : topic.name}</p>
                <div className="flex items-baseline">
                    <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mr-2">
                        Questão {currentQuestionIndex + 1}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                         de {questions.length}
                    </span>
                </div>
            </div>
            {isSimulation && (
                <div className={`flex items-center font-mono font-bold text-lg ${timeLeft < 300 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    <ClockIcon className="w-5 h-5 mr-2" />
                    {Math.floor(timeLeft / 3600).toString().padStart(2, '0')}:
                    {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}:
                    {(timeLeft % 60).toString().padStart(2, '0')}
                </div>
            )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
                className="bg-sky-500 h-2 transition-all duration-300 ease-in-out"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 leading-relaxed">
                {question.question}
            </h3>

            <div className="space-y-3">
                {question.options.map((option, index) => {
                    const isSelected = userAnswers[currentQuestionIndex] === option;
                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(option)}
                            className={`w-full p-4 text-left border rounded-lg transition-all transform active:scale-[0.99]
                                ${isSelected 
                                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-800 dark:text-sky-100 font-medium ring-2 ring-sky-500 ring-offset-1 dark:ring-offset-slate-800' 
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                                }
                            `}
                        >
                            <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${isSelected ? 'border-sky-500' : 'border-slate-400'}`}>
                                    {isSelected && <div className="w-3 h-3 rounded-full bg-sky-500"></div>}
                                </div>
                                <span>{option}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="flex justify-between items-center pt-4">
             <button
                onClick={handleExitQuiz} // Using exit here to save progress via onQuizComplete (partial) or just exit? Actually exit saves if logic supports it.
                // However for simplicity, 'Sair' usually implies saving current state which we do via effect.
                // We'll just call exit which calls parent callback.
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium px-4 py-2"
            >
                Sair
            </button>
            <button
                onClick={handleNext}
                disabled={!userAnswers[currentQuestionIndex]}
                className="bg-primary hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {currentQuestionIndex === questions.length - 1 ? 'Finalizar Quiz' : 'Próxima Questão'}
            </button>
        </div>
    </div>
  );
};

export default Quiz;