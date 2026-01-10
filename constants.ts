import { Subject, Progress, StudyDay } from './types';

export const SUBJECTS_DATA: Subject[] = [
  {
    id: 'portugues',
    name: 'Português',
    topics: [
      { 
        id: 'por1', 
        name: 'Interpretação de Textos (verbais e não-verbais)', 
        subjectId: 'portugues'
      },
      { id: 'por2', name: 'Variação Linguística e Funções da Linguagem', subjectId: 'portugues' },
      { id: 'por3', name: 'Morfologia (Classes de Palavras)', subjectId: 'portugues' },
      { id: 'por4', name: 'Sintaxe (Frase, Oração e Período)', subjectId: 'portugues' },
      { id: 'por5', name: 'Pontuação e Ortografia', subjectId: 'portugues', isPremium: true },
      { id: 'por6', name: 'Figuras de Linguagem', subjectId: 'portugues', isPremium: true },
    ],
  },
  {
    id: 'matematica',
    name: 'Matemática',
    topics: [
      { 
          id: 'mat1', 
          name: 'Conjuntos Numéricos e Operações', 
          subjectId: 'matematica'
      },
      { id: 'mat2', name: 'Razão, Proporção e Regra de Três', subjectId: 'matematica' },
      { id: 'mat3', name: 'Porcentagem e Juros Simples', subjectId: 'matematica' },
      { id: 'mat4', name: 'Álgebra (Equações e Funções de 1º/2º grau)', subjectId: 'matematica' },
      { id: 'mat5', name: 'Geometria Plana e Espacial', subjectId: 'matematica', isPremium: true },
      { id: 'mat6', name: 'Trigonometria no Triângulo Retângulo', subjectId: 'matematica', isPremium: true },
    ],
  },
    {
    id: 'ingles',
    name: 'Inglês',
    topics: [
      { id: 'ing1', name: 'Reading Comprehension (Interpretação de Texto)', subjectId: 'ingles' },
      { id: 'ing2', name: 'Verb Tenses (Tempos Verbais)', subjectId: 'ingles' },
      { id: 'ing3', name: 'Vocabulary and Synonyms', subjectId: 'ingles', isPremium: true },
      { id: 'ing4', name: 'Prepositions and Conjunctions', subjectId: 'ingles', isPremium: true },
    ],
  },
  {
    id: 'historia',
    name: 'História',
    topics: [
      { id: 'his1', name: 'História do Brasil (Colônia, Império, República)', subjectId: 'historia' },
      { id: 'his2', name: 'História Geral (Antiguidade, Idade Média, Moderna)', subjectId: 'historia' },
      { id: 'his3', name: 'Primeira e Segunda Guerra Mundial', subjectId: 'historia', isPremium: true },
      { id: 'his4', name: 'Guerra Fria e Nova Ordem Mundial', subjectId: 'historia', isPremium: true },
    ],
  },
    {
    id: 'geografia',
    name: 'Geografia',
    topics: [
      { id: 'geo1', name: 'Geografia do Brasil (Relevo, Clima, Vegetação)', subjectId: 'geografia' },
      { id: 'geo2', name: 'Globalização e Blocos Econômicos', subjectId: 'geografia' },
      { id: 'geo3', name: 'Questões Ambientais e Urbanização', subjectId: 'geografia', isPremium: true },
      { id: 'geo4', name: 'Cartografia e Fusos Horários', subjectId: 'geografia', isPremium: true },
    ],
  },
  {
    id: 'biologia',
    name: 'Biologia',
    topics: [
      { id: 'bio1', name: 'Ecologia e Sustentabilidade', subjectId: 'biologia' },
      { id: 'bio2', name: 'Citologia (Células)', subjectId: 'biologia' },
      { id: 'bio3', name: 'Genética Básica e Hereditariedade', subjectId: 'biologia', isPremium: true },
      { id: 'bio4', name: 'Corpo Humano (Sistemas)', subjectId: 'biologia', isPremium: true },
    ],
  },
  {
    id: 'fisica',
    name: 'Física',
    topics: [
        { id: 'fis1', name: 'Cinemática (Movimento, Velocidade, Aceleração)', subjectId: 'fisica' },
        { id: 'fis2', name: 'Dinâmica (Leis de Newton)', subjectId: 'fisica' },
        { id: 'fis3', name: 'Termologia (Calor e Temperatura)', subjectId: 'fisica', isPremium: true },
        { id: 'fis4', name: 'Óptica e Ondulatória', subjectId: 'fisica', isPremium: true },
    ],
  },
  {
    id: 'quimica',
    name: 'Química',
    topics: [
        { id: 'qui1', name: 'Estrutura Atômica e Tabela Periódica', subjectId: 'quimica' },
        { id: 'qui2', name: 'Ligações Químicas e Funções Inorgânicas', subjectId: 'quimica' },
        { id: 'qui3', name: 'Cálculos Químicos (Mol, Estequiometria)', subjectId: 'quimica', isPremium: true },
        { id: 'qui4', name: 'Separação de Misturas e Transformações', subjectId: 'quimica', isPremium: true },
    ],
  },
  {
      id: 'atualidades',
      name: 'Atualidades e Raciocínio Lógico',
      topics: [
          { id: 'atu1', name: 'Acontecimentos Globais Recentes', subjectId: 'atualidades' },
          { id: 'atu2', name: 'Sociedade, Economia e Política no Brasil', subjectId: 'atualidades' },
          { id: 'atu3', name: 'Raciocínio Lógico-Matemático', subjectId: 'atualidades', isPremium: true },
          { id: 'atu4', name: 'Sequências Lógicas e Resolução de Problemas', subjectId: 'atualidades', isPremium: true },
      ],
  }
];

export const ALL_TOPICS = SUBJECTS_DATA.flatMap(s => s.topics);

export const QUESTIONS_PER_DIFFICULTY: { [key in 'Fácil' | 'Médio' | 'Difícil']: number } = {
  'Fácil': 30,
  'Médio': 50,
  'Difícil': 75,
};

export const SIMULATION_QUESTIONS = 50;
export const SIMULATION_DURATION_MINUTES = 240; // 4 hours

// Distribuição de questões para o simulado, espelhando a prova real da ETEC.
export const SIMULATION_SUBJECT_DISTRIBUTION = {
    portugues: 10,
    matematica: 10,
    ciencias_humanas: 10, // História e Geografia
    ciencias_da_natureza: 15, // Biologia, Física e Química
    diversos: 5, // Inglês, Atualidades e Raciocínio Lógico
};

// Plan Limits
export const FREE_PLAN_SIMULATION_LIMIT = 1;
export const FREE_PLAN_ESSAY_LIMIT = 3;
export const FREE_PLAN_ESSAY_ANALYSIS_LIMIT = 1;
export const ESSENTIAL_PLAN_ESSAY_ANALYSIS_LIMIT = 5;
export const FREE_PLAN_DECK_LIMIT = 3;
export const FREE_PLAN_CARD_LIMIT_PER_DECK = 20;


export const getTopicById = (id: string) => ALL_TOPICS.find(t => t.id === id);
export const getSubjectById = (id: string) => SUBJECTS_DATA.find(s => s.id === id);


export const INITIAL_PROGRESS: Progress = {
  quizHistory: [],
  subjectStats: {},
  completedTasks: [],
  essayAnalysisCount: 0,
  simulationAttempts: 0,
};

export const STUDY_PLAN_DATA: StudyDay[] = [
    { day: 'Segunda', topics: [{ subjectId: 'portugues', topicId: 'por1' }, { subjectId: 'matematica', topicId: 'mat1' }] },
    { day: 'Terça', topics: [{ subjectId: 'historia', topicId: 'his1' }, { subjectId: 'geografia', topicId: 'geo1' }] },
    { day: 'Quarta', topics: [{ subjectId: 'biologia', topicId: 'bio1' }, { subjectId: 'fisica', topicId: 'fis1' }, { subjectId: 'quimica', topicId: 'qui1' }] },
    { day: 'Quinta', topics: [{ subjectId: 'portugues', topicId: 'por2' }, { subjectId: 'matematica', topicId: 'mat2' }] },
    { day: 'Sexta', topics: [{ subjectId: 'historia', topicId: 'his2' }, { subjectId: 'geografia', topicId: 'geo2' }, { subjectId: 'ingles', topicId: 'ing1' }] },
    { day: 'Sábado', topics: [{ subjectId: 'atualidades', topicId: 'atu3' }, { subjectId: 'fisica', topicId: 'fis2' }, { subjectId: 'quimica', topicId: 'qui2' }] },
    { day: 'Domingo', topics: [] },
];

export const generateSmartSearchLinks = (topicName: string, subjectName: string) => {
    // Limpeza para garantir que a busca seja focada no tema principal
    const cleanTopic = topicName.replace(/[^\w\sÀ-ÿ,.-]/g, '');

    // 1. Busca de Videoaula Específica
    // Ex: "videoaula Morfologia Português explicação para vestibulinho etec"
    const youtubeQuery = encodeURIComponent(`videoaula ${subjectName} ${cleanTopic} explicação para vestibulinho etec`);
    
    // 2. Busca de Canais de Estudo
    // Ex: "melhores canais youtube estudar Português preparatório etec"
    const youtubeChannelQuery = encodeURIComponent(`melhores canais youtube estudar ${subjectName} preparatório etec`);

    // 3. Busca de Artigos e Resumos
    // Ex: "Português Morfologia resumo teoria exercícios etec"
    const googleQuery = encodeURIComponent(`${subjectName} ${cleanTopic} resumo teoria exercícios etec`);

    return [
        { 
            title: `Assistir Videoaula: ${topicName}`, 
            url: `https://www.youtube.com/results?search_query=${youtubeQuery}`,
            type: 'video'
        },
        { 
            title: `Canais de ${subjectName} para ETEC`, 
            url: `https://www.youtube.com/results?search_query=${youtubeChannelQuery}`,
            type: 'video'
        },
        { 
            title: 'Ler Resumo e Artigos (Google)', 
            url: `https://www.google.com/search?q=${googleQuery}`,
            type: 'article'
        }
    ];
};