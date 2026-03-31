import { v4 as uuidv4 } from 'uuid';

import { Module, Question } from './types';

export type QuestionTemplate = Omit<Question, 'id'>;

export interface ModuleTemplate extends Omit<Module, 'id' | 'questions'> {
  questions: QuestionTemplate[];
}

export const PREBUILT_SEX_OPTIONS = [
  'Homme',
  'Femme',
  'Préfère ne pas répondre',
];

export const DEFAULT_RECRUITMENT_QUESTION_TEMPLATES: QuestionTemplate[] = [
  {
    type: 'nombre',
    label: 'Quel est votre âge ?',
    consigne: {
      type: 'texte',
      content: 'Indiquez votre âge en années complètes.',
    },
    required: true,
    order: 0,
    eligibility: {
      enabled: true,
      rules: [],
      numericRange: {
        min: 52,
        effect: 'include',
      },
    },
  },
  {
    type: 'qcm',
    label: 'Sexe',
    consigne: {
      type: 'texte',
      content: 'Quel est votre sexe ?',
    },
    required: true,
    options: PREBUILT_SEX_OPTIONS,
    order: 1,
    eligibility: {
      enabled: true,
      rules: PREBUILT_SEX_OPTIONS.map((answer) => ({
        answer,
        effect: answer === 'Préfère ne pas répondre' ? 'exclude' : 'include',
      })),
    },
  },
];

export const DEFAULT_RECRUITMENT_MODULE_TEMPLATE: ModuleTemplate = {
  name: 'Pré-qualification',
  description:
    'Questions initiales pour définir les critères incluants et excluants du recrutement.',
  order: 0,
  questions: DEFAULT_RECRUITMENT_QUESTION_TEMPLATES,
};

function cloneQuestionTemplate(template: QuestionTemplate, id: string, order: number): Question {
  return {
    ...template,
    id,
    order,
    consigne: { ...template.consigne },
    options: template.options ? [...template.options] : undefined,
    eligibility: template.eligibility
      ? {
          ...template.eligibility,
          rules: template.eligibility.rules.map((rule) => ({ ...rule })),
          numericRange: template.eligibility.numericRange
            ? { ...template.eligibility.numericRange }
            : undefined,
        }
      : undefined,
  };
}

export function materializeQuestionTemplate(
  template: QuestionTemplate,
  id: string,
  order: number
): Question {
  return cloneQuestionTemplate(template, id, order);
}

export function createDefaultRecruitmentModule(): Module {
  return {
    id: uuidv4(),
    name: DEFAULT_RECRUITMENT_MODULE_TEMPLATE.name,
    description: DEFAULT_RECRUITMENT_MODULE_TEMPLATE.description,
    order: DEFAULT_RECRUITMENT_MODULE_TEMPLATE.order,
    questions: DEFAULT_RECRUITMENT_MODULE_TEMPLATE.questions.map((question, index) =>
      cloneQuestionTemplate(question, uuidv4(), index)
    ),
  };
}
