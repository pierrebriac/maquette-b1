export type StudyStatus = 'brouillon' | 'publiee' | 'terminee';

export type QuestionType = 'qcm' | 'texte' | 'likert' | 'audio' | 'video' | 'ia' | 'video_visionnage';

export type ConsigneType = 'texte' | 'audio' | 'image' | 'video' | 'mixte';

export interface Consigne {
  type: ConsigneType;
  content: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  consigne: Consigne;
  required: boolean;
  options?: string[];
  order: number;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  order: number;
  questions: Question[];
}

export interface Protocol {
  id: string;
  version: string;
  modules: Module[];
}

export interface Study {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: StudyStatus;
  createdAt: string;
  updatedAt: string;
  ethicsApprovalFileName?: string;
  consentConfigured: boolean;
  recruitmentTarget: number;
  recruitedCount: number;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  protocol: Protocol;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'chercheur_principal' | 'collaborateur' | 'assistant';
  avatar: string;
}

export interface CommunityItem {
  id: string;
  type: 'dataset' | 'protocole' | 'modele';
  name: string;
  description: string;
  author: string;
  downloads: number;
  tags: string[];
  createdAt: string;
}

export interface LabSettings {
  labName: string;
  email: string;
  timezone: string;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  qcm: 'QCM',
  texte: 'Texte libre',
  likert: 'Échelle de Likert',
  audio: 'Enregistrement audio',
  video: 'Enregistrement vidéo',
  ia: 'Conversation IA',
  video_visionnage: 'Visionnage vidéo',
};

export const STATUS_LABELS: Record<StudyStatus, string> = {
  brouillon: 'Brouillon',
  publiee: 'Publiée',
  terminee: 'Terminée',
};

export const ROLE_LABELS: Record<TeamMember['role'], string> = {
  chercheur_principal: 'Chercheur principal',
  collaborateur: 'Collaborateur',
  assistant: 'Assistant',
};
