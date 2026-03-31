'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStudy, saveStudy, deleteStudy } from '@/lib/store';
import { Study, StudyStatus, STATUS_LABELS, QUESTION_TYPE_LABELS, Module, Question, EligibilityEffect, EligibilityRule, NumericEligibilityRange } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft, Save, Trash2, Play, Download, Upload, Plus, X, Check,
  GripVertical, Mic, Video, MessageSquare, ListChecks, Type, Hash,
  BarChart3, Eye, FileText, Link2, Users, ChevronDown, ChevronUp,
  Library, Search,
} from 'lucide-react';
import {
  LIBRARY_MODULES, LIBRARY_QUESTIONS, MODULE_CATEGORIES, QUESTION_CATEGORIES,
  SOURCE_LABELS, LibraryModule, LibraryQuestion,
} from '@/lib/library';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const questionTypeIcons: Record<string, React.ReactNode> = {
  qcm: <ListChecks className="h-4 w-4" />,
  texte: <Type className="h-4 w-4" />,
  likert: <BarChart3 className="h-4 w-4" />,
  nombre: <Hash className="h-4 w-4" />,
  audio: <Mic className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  ia: <MessageSquare className="h-4 w-4" />,
  video_visionnage: <Eye className="h-4 w-4" />,
};

function SortableModuleItem({
  module: mod,
  isSelected,
  onClick,
}: {
  module: Module;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: mod.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
        isSelected ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-accent/50'
      }`}
      onClick={onClick}
    >
      <button {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{mod.name}</p>
        <p className="text-xs text-muted-foreground">
          {mod.questions.length} question{mod.questions.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

function SortableQuestionItem({
  question,
  onDelete,
  onUpdate,
}: {
  question: Question;
  onDelete: () => void;
  onUpdate: (q: Question) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-card"
    >
      <div className="flex items-center gap-2 p-3">
        <button {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="shrink-0">{questionTypeIcons[question.type]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{question.label}</p>
          <p className="text-xs text-muted-foreground">
            {QUESTION_TYPE_LABELS[question.type]}
            {question.required && ' · Obligatoire'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      {expanded && (
        <div className="border-t p-3 space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Libellé</Label>
            <Input
              value={question.label}
              onChange={(e) =>
                onUpdate({ ...question, label: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Consigne</Label>
            <Textarea
              value={question.consigne.content}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  consigne: { ...question.consigne, content: e.target.value },
                })
              }
              rows={2}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Type de question</Label>
            <div className="grid grid-cols-4 gap-1">
              {(Object.keys(QUESTION_TYPE_LABELS) as Array<keyof typeof QUESTION_TYPE_LABELS>).map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdate({ ...question, type: t })}
                  className={`flex flex-col items-center gap-1 rounded-md border p-2 text-xs transition-colors ${
                    question.type === t
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'hover:bg-accent'
                  }`}
                >
                  {questionTypeIcons[t]}
                  <span className="text-[10px] leading-tight text-center">
                    {QUESTION_TYPE_LABELS[t]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {(question.type === 'qcm' || question.type === 'likert') && (
            <div className="space-y-1">
              <Label className="text-xs">Options (une par ligne)</Label>
              <Textarea
                value={(question.options || []).join('\n')}
                onChange={(e) =>
                  onUpdate({
                    ...question,
                    options: e.target.value.split('\n').filter(Boolean),
                  })
                }
                rows={3}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Switch
              checked={question.required}
              onCheckedChange={(checked) =>
                onUpdate({ ...question, required: checked })
              }
            />
            <Label className="text-xs">Obligatoire</Label>
          </div>
          {((question.type === 'qcm' || question.type === 'likert') && question.options && question.options.length > 0 || question.type === 'nombre') && (
            <div className="space-y-2 rounded-lg border border-dashed p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={question.eligibility?.enabled ?? false}
                    onCheckedChange={(checked) => {
                      if (question.type === 'nombre') {
                        onUpdate({
                          ...question,
                          eligibility: {
                            enabled: checked,
                            rules: [],
                            numericRange: question.eligibility?.numericRange ?? { min: undefined, max: undefined, effect: 'include' },
                          },
                        });
                      } else {
                        const rules: EligibilityRule[] = (question.options || []).map((opt) => ({
                          answer: opt,
                          effect: (question.eligibility?.rules.find((r) => r.answer === opt)?.effect ?? 'neutral') as EligibilityEffect,
                        }));
                        onUpdate({
                          ...question,
                          eligibility: { enabled: checked, rules },
                        });
                      }
                    }}
                  />
                  <Label className="text-xs font-medium">Critère d&apos;éligibilité</Label>
                </div>
              </div>
              {question.eligibility?.enabled && question.type === 'nombre' && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground">
                    Définissez la plage de valeurs acceptée. Les réponses hors de cette plage seront excluantes.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px]">Min</Label>
                      <Input
                        type="number"
                        placeholder="—"
                        value={question.eligibility.numericRange?.min ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                          onUpdate({
                            ...question,
                            eligibility: {
                              ...question.eligibility!,
                              numericRange: {
                                ...question.eligibility!.numericRange!,
                                min: val,
                              },
                            },
                          });
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px]">Max</Label>
                      <Input
                        type="number"
                        placeholder="—"
                        value={question.eligibility.numericRange?.max ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                          onUpdate({
                            ...question,
                            eligibility: {
                              ...question.eligibility!,
                              numericRange: {
                                ...question.eligibility!.numericRange!,
                                max: val,
                              },
                            },
                          });
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  {(question.eligibility.numericRange?.min != null || question.eligibility.numericRange?.max != null) && (
                    <div className="rounded-md bg-green-50 border border-green-200 px-3 py-1.5 text-xs text-green-700">
                      Incluant : {question.eligibility.numericRange?.min != null ? question.eligibility.numericRange.min : '−∞'}
                      {' → '}
                      {question.eligibility.numericRange?.max != null ? question.eligibility.numericRange.max : '+∞'}
                    </div>
                  )}
                  {(question.eligibility.numericRange?.min != null || question.eligibility.numericRange?.max != null) && (
                    <div className="rounded-md bg-red-50 border border-red-200 px-3 py-1.5 text-xs text-red-700">
                      Excluant : hors de cette plage
                    </div>
                  )}
                </div>
              )}
              {question.eligibility?.enabled && question.type !== 'nombre' && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground">
                    Cliquez sur chaque réponse pour définir son effet sur l&apos;éligibilité.
                  </p>
                  {(question.options || []).map((opt) => {
                    const rule = question.eligibility?.rules.find((r) => r.answer === opt);
                    const effect = rule?.effect ?? 'neutral';
                    const nextEffect: Record<EligibilityEffect, EligibilityEffect> = {
                      neutral: 'include',
                      include: 'exclude',
                      exclude: 'neutral',
                    };
                    const effectStyles: Record<EligibilityEffect, string> = {
                      neutral: 'bg-muted text-muted-foreground',
                      include: 'bg-green-100 text-green-700 border-green-300',
                      exclude: 'bg-red-100 text-red-700 border-red-300',
                    };
                    const effectLabels: Record<EligibilityEffect, string> = {
                      neutral: 'Neutre',
                      include: 'Incluant',
                      exclude: 'Excluant',
                    };
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          const newRules = (question.eligibility?.rules || []).map((r) =>
                            r.answer === opt ? { ...r, effect: nextEffect[r.effect] } : r
                          );
                          onUpdate({
                            ...question,
                            eligibility: { ...question.eligibility!, rules: newRules },
                          });
                        }}
                        className={`flex w-full items-center justify-between rounded-md border px-3 py-1.5 text-xs transition-colors ${effectStyles[effect]}`}
                      >
                        <span>{opt}</span>
                        <span className="font-medium">{effectLabels[effect]}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [study, setStudy] = useState<Study | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [moduleLibraryOpen, setModuleLibraryOpen] = useState(false);
  const [questionLibraryOpen, setQuestionLibraryOpen] = useState(false);
  const [libModuleSearch, setLibModuleSearch] = useState('');
  const [libModuleCategory, setLibModuleCategory] = useState<string | null>(null);
  const [libQuestionSearch, setLibQuestionSearch] = useState('');
  const [libQuestionCategory, setLibQuestionCategory] = useState<string | null>(null);
  const [selectedLibQuestions, setSelectedLibQuestions] = useState<Set<string>>(new Set());
  const [eligibilityPickerOpen, setEligibilityPickerOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const s = getStudy(params.id as string);
    if (s) {
      setStudy(s);
      if (s.protocol.modules.length > 0 && !selectedModuleId) {
        setSelectedModuleId(s.protocol.modules[0].id);
      }
    }
  }, [params.id]);

  if (!study) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Étude non trouvée</p>
      </div>
    );
  }

  function persist(updated: Study) {
    setStudy(updated);
    saveStudy(updated);
  }

  function handleExportProtocol() {
    const data = JSON.stringify(study, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protocole_${study!.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Protocole exporté');
  }

  function handleDeleteStudy() {
    if (confirm('Supprimer cette étude ? Cette action est irréversible.')) {
      deleteStudy(study!.id);
      toast.success('Étude supprimée');
      router.push('/etudes');
    }
  }

  function addModule() {
    const newModule: Module = {
      id: uuidv4(),
      name: `Module ${study!.protocol.modules.length + 1}`,
      description: '',
      order: study!.protocol.modules.length,
      questions: [],
    };
    const updated = {
      ...study!,
      updatedAt: new Date().toISOString(),
      protocol: {
        ...study!.protocol,
        modules: [...study!.protocol.modules, newModule],
      },
    };
    persist(updated);
    setSelectedModuleId(newModule.id);
  }

  function deleteModule(moduleId: string) {
    const updated = {
      ...study!,
      updatedAt: new Date().toISOString(),
      protocol: {
        ...study!.protocol,
        modules: study!.protocol.modules.filter((m) => m.id !== moduleId),
      },
    };
    persist(updated);
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(updated.protocol.modules[0]?.id || null);
    }
  }

  function addQuestion() {
    if (!selectedModuleId) return;
    const mod = study!.protocol.modules.find((m) => m.id === selectedModuleId);
    if (!mod) return;
    const newQ: Question = {
      id: uuidv4(),
      type: 'qcm',
      label: `Question ${mod.questions.length + 1}`,
      consigne: { type: 'texte', content: '' },
      required: true,
      options: ['Option 1', 'Option 2'],
      order: mod.questions.length,
    };
    const updated = {
      ...study!,
      updatedAt: new Date().toISOString(),
      protocol: {
        ...study!.protocol,
        modules: study!.protocol.modules.map((m) =>
          m.id === selectedModuleId
            ? { ...m, questions: [...m.questions, newQ] }
            : m
        ),
      },
    };
    persist(updated);
  }

  function addLibraryModule(libModule: LibraryModule) {
    const newModule: Module = {
      id: uuidv4(),
      name: libModule.name,
      description: libModule.description,
      order: study!.protocol.modules.length,
      questions: libModule.questions.map((q, i) => ({
        ...q,
        id: uuidv4(),
        order: i,
      })),
    };
    const updated = {
      ...study!,
      updatedAt: new Date().toISOString(),
      protocol: {
        ...study!.protocol,
        modules: [...study!.protocol.modules, newModule],
      },
    };
    persist(updated);
    setSelectedModuleId(newModule.id);
    setModuleLibraryOpen(false);
    toast.success(`Module "${libModule.name}" ajouté`);
  }

  function addLibraryQuestions(libQuestions: LibraryQuestion[]) {
    if (!selectedModuleId) return;
    const mod = study!.protocol.modules.find((m) => m.id === selectedModuleId);
    if (!mod) return;
    const newQuestions: Question[] = libQuestions.map((lq, i) => ({
      id: uuidv4(),
      type: lq.type,
      label: lq.label,
      consigne: lq.consigne,
      required: lq.required,
      options: lq.options,
      order: mod.questions.length + i,
    }));
    const updated = {
      ...study!,
      updatedAt: new Date().toISOString(),
      protocol: {
        ...study!.protocol,
        modules: study!.protocol.modules.map((m) =>
          m.id === selectedModuleId
            ? { ...m, questions: [...m.questions, ...newQuestions] }
            : m
        ),
      },
    };
    persist(updated);
    setQuestionLibraryOpen(false);
    setSelectedLibQuestions(new Set());
    toast.success(`${newQuestions.length} question${newQuestions.length > 1 ? 's' : ''} ajoutée${newQuestions.length > 1 ? 's' : ''}`);
  }

  // Helper to find which module contains a question
  function findModuleForQuestion(questionId: string): Module | undefined {
    return study!.protocol.modules.find((m) => m.questions.some((q) => q.id === questionId));
  }

  // Enable eligibility on a question by ID (from recruitment tab)
  function enableEligibilityOnQuestion(questionId: string) {
    const mod = findModuleForQuestion(questionId);
    if (!mod) return;
    const q = mod.questions.find((qq) => qq.id === questionId);
    if (!q) return;
    if (q.type === 'nombre') {
      updateQuestion(mod.id, {
        ...q,
        eligibility: { enabled: true, rules: [], numericRange: { min: undefined, max: undefined, effect: 'include' } },
      });
    } else {
      if (!q.options) return;
      const rules: EligibilityRule[] = q.options.map((opt) => ({
        answer: opt,
        effect: 'neutral' as EligibilityEffect,
      }));
      updateQuestion(mod.id, { ...q, eligibility: { enabled: true, rules } });
    }
    toast.success(`"${q.label}" ajoutée comme critère d'éligibilité`);
  }

  // Update eligibility rule for a specific question from recruitment tab
  function updateEligibilityRule(questionId: string, answer: string, newEffect: EligibilityEffect) {
    const mod = findModuleForQuestion(questionId);
    if (!mod) return;
    const q = mod.questions.find((qq) => qq.id === questionId);
    if (!q || !q.eligibility) return;
    const newRules = q.eligibility.rules.map((r) =>
      r.answer === answer ? { ...r, effect: newEffect } : r
    );
    updateQuestion(mod.id, { ...q, eligibility: { ...q.eligibility, rules: newRules } });
  }

  // Update numeric range for a question from recruitment tab
  function updateNumericRange(questionId: string, range: Partial<NumericEligibilityRange>) {
    const mod = findModuleForQuestion(questionId);
    if (!mod) return;
    const q = mod.questions.find((qq) => qq.id === questionId);
    if (!q || !q.eligibility) return;
    updateQuestion(mod.id, {
      ...q,
      eligibility: {
        ...q.eligibility,
        numericRange: { ...q.eligibility.numericRange!, ...range },
      },
    });
  }

  // Remove eligibility from a question
  function removeEligibility(questionId: string) {
    const mod = findModuleForQuestion(questionId);
    if (!mod) return;
    const q = mod.questions.find((qq) => qq.id === questionId);
    if (!q) return;
    updateQuestion(mod.id, { ...q, eligibility: { enabled: false, rules: [] } });
  }

  // Get all questions with eligibility enabled
  function getEligibilityQuestions(): (Question & { moduleName: string; moduleId: string })[] {
    return study!.protocol.modules.flatMap((m) =>
      m.questions
        .filter((q) => q.eligibility?.enabled)
        .map((q) => ({ ...q, moduleName: m.name, moduleId: m.id }))
    );
  }

  // Get all eligible question types that are NOT yet eligibility criteria
  function getAvailableEligibilityQuestions(): (Question & { moduleName: string })[] {
    return study!.protocol.modules.flatMap((m) =>
      m.questions
        .filter((q) => {
          if (q.eligibility?.enabled) return false;
          if (q.type === 'nombre') return true;
          if ((q.type === 'qcm' || q.type === 'likert') && q.options && q.options.length > 0) return true;
          return false;
        })
        .map((q) => ({ ...q, moduleName: m.name }))
    );
  }

  function updateQuestion(moduleId: string, question: Question) {
    const updated = {
      ...study!,
      updatedAt: new Date().toISOString(),
      protocol: {
        ...study!.protocol,
        modules: study!.protocol.modules.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                questions: m.questions.map((q) =>
                  q.id === question.id ? question : q
                ),
              }
            : m
        ),
      },
    };
    persist(updated);
  }

  function deleteQuestion(moduleId: string, questionId: string) {
    const updated = {
      ...study!,
      updatedAt: new Date().toISOString(),
      protocol: {
        ...study!.protocol,
        modules: study!.protocol.modules.map((m) =>
          m.id === moduleId
            ? { ...m, questions: m.questions.filter((q) => q.id !== questionId) }
            : m
        ),
      },
    };
    persist(updated);
  }

  function handleModuleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = study!.protocol.modules.findIndex((m) => m.id === active.id);
    const newIndex = study!.protocol.modules.findIndex((m) => m.id === over.id);
    const updated = {
      ...study!,
      updatedAt: new Date().toISOString(),
      protocol: {
        ...study!.protocol,
        modules: arrayMove(study!.protocol.modules, oldIndex, newIndex),
      },
    };
    persist(updated);
  }

  function handleQuestionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedModuleId) return;
    const mod = study!.protocol.modules.find((m) => m.id === selectedModuleId);
    if (!mod) return;
    const oldIndex = mod.questions.findIndex((q) => q.id === active.id);
    const newIndex = mod.questions.findIndex((q) => q.id === over.id);
    const updated = {
      ...study!,
      updatedAt: new Date().toISOString(),
      protocol: {
        ...study!.protocol,
        modules: study!.protocol.modules.map((m) =>
          m.id === selectedModuleId
            ? { ...m, questions: arrayMove(m.questions, oldIndex, newIndex) }
            : m
        ),
      },
    };
    persist(updated);
  }

  const selectedModule = study.protocol.modules.find(
    (m) => m.id === selectedModuleId
  );

  const fakeDataset = [
    { participant: 'P-001', module: 'Questionnaire démographique', completion: '100%', date: '2026-01-15' },
    { participant: 'P-002', module: 'Évaluation PHQ-9', completion: '75%', date: '2026-01-16' },
    { participant: 'P-003', module: 'Enregistrement vocal', completion: '100%', date: '2026-01-17' },
    { participant: 'P-004', module: 'Interaction IA', completion: '50%', date: '2026-01-18' },
    { participant: 'P-005', module: 'Questionnaire démographique', completion: '100%', date: '2026-01-19' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/etudes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{study.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={
                  study.status === 'publiee'
                    ? 'bg-green-100 text-green-700'
                    : study.status === 'terminee'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                }
              >
                {STATUS_LABELS[study.status]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                v{study.protocol.version}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/etudes/${study.id}/simuler`}>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Vue participant
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExportProtocol}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteStudy}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="apercu">
        <TabsList>
          <TabsTrigger value="apercu">Aperçu</TabsTrigger>
          <TabsTrigger value="protocole">Protocole</TabsTrigger>
          <TabsTrigger value="ethique">Éthique</TabsTrigger>
          <TabsTrigger value="recrutement">Recrutement</TabsTrigger>
          <TabsTrigger value="donnees">Données</TabsTrigger>
        </TabsList>

        {/* APERCU TAB */}
        <TabsContent value="apercu" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de l&apos;étude</Label>
                <Input
                  value={study.name}
                  onChange={(e) =>
                    persist({ ...study, name: e.target.value, updatedAt: new Date().toISOString() })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={study.description}
                  onChange={(e) =>
                    persist({ ...study, description: e.target.value, updatedAt: new Date().toISOString() })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <div className="flex gap-2">
                  {(['brouillon', 'publiee', 'terminee'] as StudyStatus[]).map(
                    (s) => (
                      <Button
                        key={s}
                        variant={study.status === s ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                          persist({ ...study, status: s, updatedAt: new Date().toISOString() })
                        }
                      >
                        {STATUS_LABELS[s]}
                      </Button>
                    )
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1">
                  {study.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        onClick={() =>
                          persist({
                            ...study,
                            tags: study.tags.filter((t) => t !== tag),
                            updatedAt: new Date().toISOString(),
                          })
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <button
                    className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
                    onClick={() => {
                      const tag = prompt('Nouveau tag :');
                      if (tag && !study.tags.includes(tag)) {
                        persist({
                          ...study,
                          tags: [...study.tags, tag],
                          updatedAt: new Date().toISOString(),
                        });
                      }
                    }}
                  >
                    <Plus className="h-3 w-3" /> Ajouter
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROTOCOLE TAB */}
        <TabsContent value="protocole" className="mt-4">
          <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[500px]">
            {/* Left panel: modules */}
            <div className="w-72 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Modules</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button size="sm" variant="outline">
                        <Plus className="h-3 w-3 mr-1" />
                        Ajouter
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={addModule}>
                      <Plus className="h-4 w-4 mr-2" />
                      Module vierge
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setModuleLibraryOpen(true)}>
                      <Library className="h-4 w-4 mr-2" />
                      Depuis la bibliothèque...
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleModuleDragEnd}
              >
                <SortableContext
                  items={study.protocol.modules.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {study.protocol.modules.map((mod) => (
                      <SortableModuleItem
                        key={mod.id}
                        module={mod}
                        isSelected={mod.id === selectedModuleId}
                        onClick={() => setSelectedModuleId(mod.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {study.protocol.modules.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Aucun module. Cliquez sur &quot;Ajouter&quot; pour commencer.
                </p>
              )}
            </div>

            {/* Right panel: questions */}
            <div className="flex-1 overflow-auto border rounded-lg p-4 space-y-4">
              {selectedModule ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 mr-4">
                      <Input
                        value={selectedModule.name}
                        onChange={(e) => {
                          const updated = {
                            ...study,
                            updatedAt: new Date().toISOString(),
                            protocol: {
                              ...study.protocol,
                              modules: study.protocol.modules.map((m) =>
                                m.id === selectedModuleId
                                  ? { ...m, name: e.target.value }
                                  : m
                              ),
                            },
                          };
                          persist(updated);
                        }}
                        className="font-semibold"
                      />
                      <Input
                        value={selectedModule.description}
                        onChange={(e) => {
                          const updated = {
                            ...study,
                            updatedAt: new Date().toISOString(),
                            protocol: {
                              ...study.protocol,
                              modules: study.protocol.modules.map((m) =>
                                m.id === selectedModuleId
                                  ? { ...m, description: e.target.value }
                                  : m
                              ),
                            },
                          };
                          persist(updated);
                        }}
                        placeholder="Description du module..."
                        className="text-sm"
                      />
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button size="sm">
                              <Plus className="h-3 w-3 mr-1" />
                              Question
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={addQuestion}>
                            <Plus className="h-4 w-4 mr-2" />
                            Question vierge
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setQuestionLibraryOpen(true); setSelectedLibQuestions(new Set()); }}>
                            <Library className="h-4 w-4 mr-2" />
                            Depuis la bibliothèque...
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteModule(selectedModuleId!)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleQuestionDragEnd}
                  >
                    <SortableContext
                      items={selectedModule.questions.map((q) => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {selectedModule.questions.map((q) => (
                          <SortableQuestionItem
                            key={q.id}
                            question={q}
                            onDelete={() =>
                              deleteQuestion(selectedModuleId!, q.id)
                            }
                            onUpdate={(updated) =>
                              updateQuestion(selectedModuleId!, updated)
                            }
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  {selectedModule.questions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Aucune question dans ce module.
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Sélectionnez ou créez un module
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ETHIQUE TAB */}
        <TabsContent value="ethique" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Approbation éthique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const fileName = prompt(
                      "Nom du fichier PDF d'approbation éthique :",
                      study.ethicsApprovalFileName || 'approbation_ethique.pdf'
                    );
                    if (fileName) {
                      persist({
                        ...study,
                        ethicsApprovalFileName: fileName,
                        updatedAt: new Date().toISOString(),
                      });
                      toast.success('Fichier enregistré');
                    }
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {study.ethicsApprovalFileName
                    ? 'Remplacer le PDF'
                    : 'Charger le PDF'}
                </Button>
                {study.ethicsApprovalFileName && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <span>{study.ethicsApprovalFileName}</span>
                  </div>
                )}
              </div>
              {!study.ethicsApprovalFileName && (
                <p className="text-sm text-amber-600">
                  Aucun document d&apos;approbation éthique n&apos;a été chargé.
                  Ce document est requis avant de pouvoir publier l&apos;étude.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consentement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-sm">
                    Formulaire de consentement
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Le participant devra valider le consentement avant de
                    commencer le protocole
                  </p>
                </div>
                <Switch
                  checked={study.consentConfigured}
                  onCheckedChange={(checked) =>
                    persist({
                      ...study,
                      consentConfigured: checked,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                />
              </div>
              {!study.consentConfigured && (
                <p className="text-sm text-amber-600">
                  Le consentement n&apos;est pas configuré. Il est obligatoire
                  pour lancer le recrutement.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RECRUTEMENT TAB */}
        <TabsContent value="recrutement" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Suivi du recrutement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{study.recruitedCount}</p>
                  <p className="text-xs text-muted-foreground">Recrutés</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {study.recruitmentTarget}
                  </p>
                  <p className="text-xs text-muted-foreground">Objectif</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {study.recruitmentTarget > 0
                      ? Math.round(
                          (study.recruitedCount / study.recruitmentTarget) * 100
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-muted-foreground">Complétion</p>
                </div>
              </div>
              <Progress
                value={
                  study.recruitmentTarget > 0
                    ? (study.recruitedCount / study.recruitmentTarget) * 100
                    : 0
                }
                className="h-3"
              />
              <div className="space-y-2">
                <Label>Objectif de recrutement</Label>
                <Input
                  type="number"
                  value={study.recruitmentTarget}
                  onChange={(e) =>
                    persist({
                      ...study,
                      recruitmentTarget: parseInt(e.target.value) || 0,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Critères d'éligibilité basés sur le protocole */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Critères d&apos;éligibilité</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-72">
                  {getAvailableEligibilityQuestions().length > 0 ? (
                    getAvailableEligibilityQuestions().map((q) => (
                      <DropdownMenuItem key={q.id} onClick={() => enableEligibilityOnQuestion(q.id)}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{q.label}</p>
                          <p className="text-[10px] text-muted-foreground">{q.moduleName} · {QUESTION_TYPE_LABELS[q.type]}</p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                      Aucune question QCM / Likert disponible.
                      <br />Ajoutez des questions au protocole d&apos;abord.
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              {getEligibilityQuestions().length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun critère d&apos;éligibilité défini. Utilisez le bouton &quot;Ajouter&quot; pour sélectionner
                  une question du protocole comme critère, ou activez-le directement dans l&apos;onglet Protocole.
                </p>
              ) : (
                getEligibilityQuestions().map((q) => {
                  const effectStyles: Record<EligibilityEffect, string> = {
                    neutral: 'bg-muted text-muted-foreground',
                    include: 'bg-green-100 text-green-700 border-green-300',
                    exclude: 'bg-red-100 text-red-700 border-red-300',
                  };
                  const effectLabels: Record<EligibilityEffect, string> = {
                    neutral: 'Neutre',
                    include: 'Incluant',
                    exclude: 'Excluant',
                  };
                  const nextEffect: Record<EligibilityEffect, EligibilityEffect> = {
                    neutral: 'include',
                    include: 'exclude',
                    exclude: 'neutral',
                  };
                  return (
                    <div key={q.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{q.label}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {q.moduleName} · {QUESTION_TYPE_LABELS[q.type]}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEligibility(q.id)}
                          title="Retirer ce critère"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {q.type === 'nombre' && q.eligibility?.numericRange ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 space-y-1">
                              <Label className="text-[10px]">Min</Label>
                              <Input
                                type="number"
                                placeholder="—"
                                value={q.eligibility.numericRange.min ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                                  updateNumericRange(q.id, { min: val });
                                }}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <Label className="text-[10px]">Max</Label>
                              <Input
                                type="number"
                                placeholder="—"
                                value={q.eligibility.numericRange.max ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                                  updateNumericRange(q.id, { max: val });
                                }}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                          {(q.eligibility.numericRange.min != null || q.eligibility.numericRange.max != null) && (
                            <>
                              <div className="rounded-md bg-green-50 border border-green-200 px-3 py-1.5 text-xs text-green-700">
                                Incluant : {q.eligibility.numericRange.min != null ? q.eligibility.numericRange.min : '−∞'}
                                {' → '}
                                {q.eligibility.numericRange.max != null ? q.eligibility.numericRange.max : '+∞'}
                              </div>
                              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-1.5 text-xs text-red-700">
                                Excluant : hors de cette plage
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5">
                          {q.eligibility?.rules.map((rule) => (
                            <button
                              key={rule.answer}
                              onClick={() => updateEligibilityRule(q.id, rule.answer, nextEffect[rule.effect])}
                              className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs transition-colors ${effectStyles[rule.effect]}`}
                            >
                              <span className="truncate mr-1">{rule.answer}</span>
                              <span className="font-medium shrink-0">{effectLabels[rule.effect]}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lien de recrutement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={`https://apertum.io/participer/${study.id}`}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://apertum.io/participer/${study.id}`
                    );
                    toast.success('Lien copié');
                  }}
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Partagez ce lien ou générez un QR code pour recruter des
                participants.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DONNEES TAB */}
        <TabsContent value="donnees" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Aperçu des données</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Export CSV simulé')}
              >
                <Download className="mr-2 h-4 w-4" />
                Exporter CSV
              </Button>
            </CardHeader>
            <CardContent>
              {study.status === 'terminee' || study.recruitedCount > 0 ? (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">
                          Participant
                        </th>
                        <th className="text-left p-2 font-medium">
                          Module
                        </th>
                        <th className="text-left p-2 font-medium">
                          Complétion
                        </th>
                        <th className="text-left p-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fakeDataset.map((row, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2 font-mono">{row.participant}</td>
                          <td className="p-2">{row.module}</td>
                          <td className="p-2">
                            <Badge variant="secondary">{row.completion}</Badge>
                          </td>
                          <td className="p-2 text-muted-foreground">
                            {row.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune donnée collectée pour le moment. Les données
                  apparaîtront ici une fois le recrutement lancé.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Module Library Dialog */}
      <Dialog open={moduleLibraryOpen} onOpenChange={setModuleLibraryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Bibliothèque de modules</DialogTitle>
            <DialogDescription>
              Ajoutez un module préfait à votre protocole. Les questions incluses seront copiées.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un module..."
                value={libModuleSearch}
                onChange={(e) => setLibModuleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setLibModuleCategory(null)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  !libModuleCategory
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Tous
              </button>
              {MODULE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLibModuleCategory(libModuleCategory === cat ? null : cat)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    libModuleCategory === cat
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-auto space-y-2 pr-1">
              {LIBRARY_MODULES
                .filter((m) => {
                  const matchSearch = !libModuleSearch ||
                    m.name.toLowerCase().includes(libModuleSearch.toLowerCase()) ||
                    m.description.toLowerCase().includes(libModuleSearch.toLowerCase());
                  const matchCat = !libModuleCategory || m.category === libModuleCategory;
                  return matchSearch && matchCat;
                })
                .map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => addLibraryModule(mod)}
                    className="w-full text-left rounded-lg border p-3 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{mod.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {mod.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {SOURCE_LABELS[mod.source]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{mod.questions.length} question{mod.questions.length > 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>{mod.author}</span>
                      <span>·</span>
                      <span>{mod.downloads} utilisations</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Library Dialog */}
      <Dialog open={questionLibraryOpen} onOpenChange={(open) => { setQuestionLibraryOpen(open); if (!open) setSelectedLibQuestions(new Set()); }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Bibliothèque de questions</DialogTitle>
            <DialogDescription>
              Sélectionnez une ou plusieurs questions à ajouter au module actuel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une question..."
                value={libQuestionSearch}
                onChange={(e) => setLibQuestionSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setLibQuestionCategory(null)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  !libQuestionCategory
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Tous
              </button>
              {QUESTION_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLibQuestionCategory(libQuestionCategory === cat ? null : cat)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    libQuestionCategory === cat
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-auto space-y-1.5 pr-1">
              {LIBRARY_QUESTIONS
                .filter((q) => {
                  const matchSearch = !libQuestionSearch ||
                    q.label.toLowerCase().includes(libQuestionSearch.toLowerCase()) ||
                    q.category.toLowerCase().includes(libQuestionSearch.toLowerCase());
                  const matchCat = !libQuestionCategory || q.category === libQuestionCategory;
                  return matchSearch && matchCat;
                })
                .map((q) => {
                  const isSelected = selectedLibQuestions.has(q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        const next = new Set(selectedLibQuestions);
                        if (isSelected) next.delete(q.id); else next.add(q.id);
                        setSelectedLibQuestions(next);
                      }}
                      className={`w-full text-left rounded-lg border p-3 transition-colors ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                          isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-muted-foreground/30'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="shrink-0">{questionTypeIcons[q.type]}</span>
                            <p className="text-sm font-medium truncate">{q.label}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span>{QUESTION_TYPE_LABELS[q.type]}</span>
                            <span>·</span>
                            <span>{q.author}</span>
                            <span>·</span>
                            <span>{q.downloads} utilisations</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {SOURCE_LABELS[q.source]}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
          {selectedLibQuestions.size > 0 && (
            <DialogFooter>
              <Button
                onClick={() => {
                  const selected = LIBRARY_QUESTIONS.filter((q) => selectedLibQuestions.has(q.id));
                  addLibraryQuestions(selected);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter ({selectedLibQuestions.size})
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
