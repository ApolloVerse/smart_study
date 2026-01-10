export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  isPremium?: boolean;
  studyLinks?: { title: string; url: string }[];
}

export interface Subject {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizAttempt {
  topicId: string;
  subjectId: string;
  score: number;
  date: string;
  correctAnswers: number;
  totalQuestions: number;
}

export interface SubjectStats {
  [subjectId: string]: {
    correct: number;
    total: number;
  };
}

export interface Progress {
  quizHistory: QuizAttempt[];
  subjectStats: SubjectStats;
  completedTasks: string[];
  essayAnalysisCount: number;
  simulationAttempts: number;
}

export interface QuizState {
  topic: Topic;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: (string | null)[];
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  lastUpdated: string;
  timeLeft?: number; // For simulations
}

export type Page = 'dashboard' | 'subjects' | 'planner' | 'progress' | 'settings' | 'quiz' | 'subscription' | 'checkout' | 'flashcards' | 'flashcard-study' | 'redacao' | 'support';


export interface StudyDay {
    day: 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo';
    topics: {
        topicId: string;
        subjectId: string;
    }[];
}

export interface User {
  username: string; // Used as unique ID
  password: string; // Em uma aplicação real, senhas NUNCA devem ser armazenadas em texto puro. Use hashing seguro como Argon2 ou bcrypt com um salt.
  subscriptionPlan: 'free' | 'essential' | 'premium';
  profilePicture?: string; // Base64 encoded image string
}

export interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM"
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  parentId: string | null;
}

export interface Essay {
  id: string;
  topic: string;
  content: string;
  feedback?: string;
  grade?: 'Boa' | 'Mediana' | 'Ruim';
  createdAt: string;
}