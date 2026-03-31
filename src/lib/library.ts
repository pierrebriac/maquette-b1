import { Module, Question } from './types';

export type LibrarySource = 'communaute' | 'labo';

export interface LibraryModule {
  id: string;
  name: string;
  description: string;
  source: LibrarySource;
  author: string;
  downloads: number;
  category: string;
  questions: Omit<Question, 'id'>[];
}

export interface LibraryQuestion {
  id: string;
  label: string;
  type: Question['type'];
  consigne: Question['consigne'];
  required: boolean;
  options?: string[];
  source: LibrarySource;
  author: string;
  downloads: number;
  category: string;
}

export const SOURCE_LABELS: Record<LibrarySource, string> = {
  communaute: 'Communauté',
  labo: 'Mon labo',
};

export const LIBRARY_MODULES: LibraryModule[] = [
  {
    id: 'lib-mod-1',
    name: 'Questionnaire démographique standard',
    description: 'Âge, sexe, niveau d\'éducation, situation professionnelle',
    source: 'communaute',
    author: 'Dr. Marie Dupont',
    downloads: 1243,
    category: 'Démographie',
    questions: [
      {
        type: 'qcm',
        label: 'Tranche d\'âge',
        consigne: { type: 'texte', content: 'Veuillez sélectionner votre tranche d\'âge.' },
        required: true,
        options: ['18-25 ans', '26-35 ans', '36-45 ans', '46-55 ans', '56-65 ans', '65+ ans'],
        order: 0,
      },
      {
        type: 'qcm',
        label: 'Sexe',
        consigne: { type: 'texte', content: 'Quel est votre sexe ?' },
        required: true,
        options: ['Homme', 'Femme', 'Non-binaire', 'Préfère ne pas répondre'],
        order: 1,
      },
      {
        type: 'qcm',
        label: 'Niveau d\'éducation',
        consigne: { type: 'texte', content: 'Quel est votre plus haut niveau de diplôme obtenu ?' },
        required: true,
        options: ['Secondaire', 'Collégial/CÉGEP', 'Baccalauréat', 'Maîtrise', 'Doctorat'],
        order: 2,
      },
      {
        type: 'qcm',
        label: 'Situation professionnelle',
        consigne: { type: 'texte', content: 'Quelle est votre situation professionnelle actuelle ?' },
        required: true,
        options: ['Étudiant(e)', 'Employé(e)', 'Travailleur autonome', 'Sans emploi', 'Retraité(e)'],
        order: 3,
      },
    ],
  },
  {
    id: 'lib-mod-2',
    name: 'PHQ-9 (Patient Health Questionnaire)',
    description: 'Questionnaire standardisé de dépistage de la dépression en 9 items',
    source: 'communaute',
    author: 'Dr. Kroenke et al.',
    downloads: 3891,
    category: 'Échelles validées',
    questions: [
      {
        type: 'likert',
        label: 'Peu d\'intérêt ou de plaisir à faire les choses',
        consigne: { type: 'texte', content: 'Au cours des 2 dernières semaines, à quelle fréquence avez-vous été gêné(e) par ce problème ?' },
        required: true,
        options: ['Jamais', 'Plusieurs jours', 'Plus de la moitié du temps', 'Presque tous les jours'],
        order: 0,
      },
      {
        type: 'likert',
        label: 'Se sentir triste, déprimé(e) ou désespéré(e)',
        consigne: { type: 'texte', content: 'Au cours des 2 dernières semaines, à quelle fréquence avez-vous été gêné(e) par ce problème ?' },
        required: true,
        options: ['Jamais', 'Plusieurs jours', 'Plus de la moitié du temps', 'Presque tous les jours'],
        order: 1,
      },
      {
        type: 'likert',
        label: 'Difficultés à s\'endormir ou à rester endormi(e)',
        consigne: { type: 'texte', content: 'Au cours des 2 dernières semaines, à quelle fréquence avez-vous été gêné(e) par ce problème ?' },
        required: true,
        options: ['Jamais', 'Plusieurs jours', 'Plus de la moitié du temps', 'Presque tous les jours'],
        order: 2,
      },
    ],
  },
  {
    id: 'lib-mod-3',
    name: 'GAD-7 (Anxiété généralisée)',
    description: 'Évaluation standardisée du trouble d\'anxiété généralisée en 7 items',
    source: 'communaute',
    author: 'Dr. Spitzer et al.',
    downloads: 2756,
    category: 'Échelles validées',
    questions: [
      {
        type: 'likert',
        label: 'Se sentir nerveux(se), anxieux(se) ou à bout',
        consigne: { type: 'texte', content: 'Au cours des 2 dernières semaines, à quelle fréquence avez-vous été gêné(e) par ce problème ?' },
        required: true,
        options: ['Jamais', 'Plusieurs jours', 'Plus de la moitié du temps', 'Presque tous les jours'],
        order: 0,
      },
      {
        type: 'likert',
        label: 'Être incapable d\'arrêter de s\'inquiéter ou de contrôler ses inquiétudes',
        consigne: { type: 'texte', content: 'Au cours des 2 dernières semaines, à quelle fréquence avez-vous été gêné(e) par ce problème ?' },
        required: true,
        options: ['Jamais', 'Plusieurs jours', 'Plus de la moitié du temps', 'Presque tous les jours'],
        order: 1,
      },
    ],
  },
  {
    id: 'lib-mod-4',
    name: 'Enregistrement vocal standardisé',
    description: 'Protocole d\'enregistrement audio pour l\'analyse de biomarqueurs vocaux',
    source: 'labo',
    author: 'Labo Apertum',
    downloads: 89,
    category: 'Audio & Voix',
    questions: [
      {
        type: 'audio',
        label: 'Lecture d\'un texte standard',
        consigne: { type: 'texte', content: 'Veuillez lire le texte suivant à voix haute, à un rythme naturel.' },
        required: true,
        order: 0,
      },
      {
        type: 'audio',
        label: 'Description d\'une image',
        consigne: { type: 'texte', content: 'Décrivez cette image en parlant librement pendant environ 1 minute.' },
        required: true,
        order: 1,
      },
      {
        type: 'audio',
        label: 'Parole spontanée',
        consigne: { type: 'texte', content: 'Racontez comment s\'est passée votre semaine. Parlez librement pendant 2 minutes.' },
        required: true,
        order: 2,
      },
    ],
  },
  {
    id: 'lib-mod-5',
    name: 'PSS-10 (Stress perçu)',
    description: 'Échelle de stress perçu en 10 items, version française validée',
    source: 'communaute',
    author: 'Dr. Cohen et al.',
    downloads: 1567,
    category: 'Échelles validées',
    questions: [
      {
        type: 'likert',
        label: 'Avoir été dérangé(e) par un événement inattendu',
        consigne: { type: 'texte', content: 'Au cours du dernier mois, combien de fois avez-vous...' },
        required: true,
        options: ['Jamais', 'Presque jamais', 'Parfois', 'Assez souvent', 'Très souvent'],
        order: 0,
      },
      {
        type: 'likert',
        label: 'Senti que vous étiez incapable de contrôler les choses importantes',
        consigne: { type: 'texte', content: 'Au cours du dernier mois, combien de fois avez-vous...' },
        required: true,
        options: ['Jamais', 'Presque jamais', 'Parfois', 'Assez souvent', 'Très souvent'],
        order: 1,
      },
    ],
  },
  {
    id: 'lib-mod-6',
    name: 'Interaction conversationnelle IA',
    description: 'Module de conversation avec un agent IA pour évaluation cognitive et émotionnelle',
    source: 'labo',
    author: 'Labo Apertum',
    downloads: 42,
    category: 'IA & Cognition',
    questions: [
      {
        type: 'ia',
        label: 'Conversation libre avec l\'agent IA',
        consigne: { type: 'texte', content: 'Discutez librement avec l\'agent IA pendant environ 5 minutes. L\'agent vous posera des questions sur votre bien-être.' },
        required: true,
        order: 0,
      },
    ],
  },
];

export const LIBRARY_QUESTIONS: LibraryQuestion[] = [
  // Démographie
  {
    id: 'lib-q-1',
    label: 'Tranche d\'âge',
    type: 'qcm',
    consigne: { type: 'texte', content: 'Veuillez sélectionner votre tranche d\'âge.' },
    required: true,
    options: ['18-25 ans', '26-35 ans', '36-45 ans', '46-55 ans', '56-65 ans', '65+ ans'],
    source: 'communaute',
    author: 'Dr. Marie Dupont',
    downloads: 2104,
    category: 'Démographie',
  },
  {
    id: 'lib-q-2',
    label: 'Sexe',
    type: 'qcm',
    consigne: { type: 'texte', content: 'Quel est votre sexe ?' },
    required: true,
    options: ['Homme', 'Femme', 'Non-binaire', 'Préfère ne pas répondre'],
    source: 'communaute',
    author: 'Dr. Marie Dupont',
    downloads: 2089,
    category: 'Démographie',
  },
  {
    id: 'lib-q-3',
    label: 'Niveau d\'éducation',
    type: 'qcm',
    consigne: { type: 'texte', content: 'Quel est votre plus haut niveau de diplôme obtenu ?' },
    required: true,
    options: ['Secondaire', 'Collégial/CÉGEP', 'Baccalauréat', 'Maîtrise', 'Doctorat'],
    source: 'communaute',
    author: 'Dr. Marie Dupont',
    downloads: 1876,
    category: 'Démographie',
  },
  {
    id: 'lib-q-4',
    label: 'Langue maternelle',
    type: 'qcm',
    consigne: { type: 'texte', content: 'Quelle est votre langue maternelle ?' },
    required: true,
    options: ['Français', 'Anglais', 'Espagnol', 'Arabe', 'Autre'],
    source: 'communaute',
    author: 'Dr. Marie Dupont',
    downloads: 1432,
    category: 'Démographie',
  },
  {
    id: 'lib-q-5',
    label: 'Situation professionnelle',
    type: 'qcm',
    consigne: { type: 'texte', content: 'Quelle est votre situation professionnelle actuelle ?' },
    required: true,
    options: ['Étudiant(e)', 'Employé(e)', 'Travailleur autonome', 'Sans emploi', 'Retraité(e)'],
    source: 'communaute',
    author: 'Dr. Marie Dupont',
    downloads: 1654,
    category: 'Démographie',
  },
  // Santé
  {
    id: 'lib-q-6',
    label: 'État de santé général perçu',
    type: 'likert',
    consigne: { type: 'texte', content: 'Comment évalueriez-vous votre état de santé général ?' },
    required: true,
    options: ['Excellent', 'Très bon', 'Bon', 'Passable', 'Mauvais'],
    source: 'communaute',
    author: 'Dr. Jean Tremblay',
    downloads: 987,
    category: 'Santé',
  },
  {
    id: 'lib-q-7',
    label: 'Qualité du sommeil',
    type: 'likert',
    consigne: { type: 'texte', content: 'Au cours du dernier mois, comment évalueriez-vous la qualité globale de votre sommeil ?' },
    required: true,
    options: ['Très bonne', 'Plutôt bonne', 'Plutôt mauvaise', 'Très mauvaise'],
    source: 'communaute',
    author: 'Dr. Jean Tremblay',
    downloads: 876,
    category: 'Santé',
  },
  {
    id: 'lib-q-8',
    label: 'Consommation de substances',
    type: 'qcm',
    consigne: { type: 'texte', content: 'Consommez-vous régulièrement l\'une de ces substances ?' },
    required: false,
    options: ['Tabac', 'Alcool (quotidien)', 'Cannabis', 'Aucune', 'Préfère ne pas répondre'],
    source: 'communaute',
    author: 'Dr. Jean Tremblay',
    downloads: 654,
    category: 'Santé',
  },
  // Audio
  {
    id: 'lib-q-9',
    label: 'Lecture de texte standardisé',
    type: 'audio',
    consigne: { type: 'texte', content: 'Lisez le passage suivant à voix haute, à un rythme naturel et confortable.' },
    required: true,
    source: 'labo',
    author: 'Labo Apertum',
    downloads: 156,
    category: 'Audio & Voix',
  },
  {
    id: 'lib-q-10',
    label: 'Parole spontanée (2 min)',
    type: 'audio',
    consigne: { type: 'texte', content: 'Parlez librement de votre journée pendant environ 2 minutes.' },
    required: true,
    source: 'labo',
    author: 'Labo Apertum',
    downloads: 134,
    category: 'Audio & Voix',
  },
  // Cognition
  {
    id: 'lib-q-11',
    label: 'Conversation IA — bien-être',
    type: 'ia',
    consigne: { type: 'texte', content: 'Discutez avec l\'agent IA au sujet de votre bien-être. La conversation dure environ 5 minutes.' },
    required: true,
    source: 'labo',
    author: 'Labo Apertum',
    downloads: 67,
    category: 'IA & Cognition',
  },
  {
    id: 'lib-q-12',
    label: 'Commentaires libres',
    type: 'texte',
    consigne: { type: 'texte', content: 'Avez-vous des commentaires ou remarques supplémentaires ?' },
    required: false,
    source: 'communaute',
    author: 'Dr. Marie Dupont',
    downloads: 2341,
    category: 'Général',
  },
];

export const MODULE_CATEGORIES = [...new Set(LIBRARY_MODULES.map((m) => m.category))];
export const QUESTION_CATEGORIES = [...new Set(LIBRARY_QUESTIONS.map((q) => q.category))];
