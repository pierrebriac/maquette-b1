'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStudy } from '@/lib/store';
import { Study, Question, QUESTION_TYPE_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  X,
  Mic,
  Video,
  MessageSquare,
  Play,
  CheckCircle2,
} from 'lucide-react';

export default function SimulationPage() {
  const params = useParams();
  const router = useRouter();
  const [study, setStudy] = useState<Study | null>(null);
  const [showConsent, setShowConsent] = useState(true);
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const s = getStudy(params.id as string);
    if (s) setStudy(s);
  }, [params.id]);

  if (!study) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Étude non trouvée</p>
      </div>
    );
  }

  const allQuestions: { moduleIdx: number; questionIdx: number; question: Question; moduleName: string }[] = [];
  study.protocol.modules.forEach((mod, mi) => {
    mod.questions.forEach((q, qi) => {
      allQuestions.push({ moduleIdx: mi, questionIdx: qi, question: q, moduleName: mod.name });
    });
  });

  const flatIdx = allQuestions.findIndex(
    (aq) => aq.moduleIdx === currentModuleIdx && aq.questionIdx === currentQuestionIdx
  );
  const totalQuestions = allQuestions.length;
  const progressPercent = totalQuestions > 0 ? ((flatIdx + 1) / totalQuestions) * 100 : 0;
  const current = allQuestions[flatIdx];

  function goNext() {
    if (flatIdx < totalQuestions - 1) {
      const next = allQuestions[flatIdx + 1];
      setCurrentModuleIdx(next.moduleIdx);
      setCurrentQuestionIdx(next.questionIdx);
    } else {
      setFinished(true);
    }
  }

  function goPrev() {
    if (flatIdx > 0) {
      const prev = allQuestions[flatIdx - 1];
      setCurrentModuleIdx(prev.moduleIdx);
      setCurrentQuestionIdx(prev.questionIdx);
    }
  }

  function handleExit() {
    router.push(`/etudes/${study!.id}`);
  }

  // Consent screen
  if (showConsent) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h1 className="text-lg font-semibold">Simulation — {study.name}</h1>
          <Button variant="ghost" size="sm" onClick={handleExit}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>Formulaire de consentement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                En participant à cette étude, vous acceptez que vos réponses
                soient collectées et traitées de manière anonyme à des fins de
                recherche scientifique.
              </p>
              <p className="text-sm text-muted-foreground">
                Vous pouvez interrompre votre participation à tout moment sans
                justification.
              </p>
              <p className="text-sm text-muted-foreground">
                Cette étude a reçu l&apos;approbation du comité d&apos;éthique.
                {study.ethicsApprovalFileName && (
                  <span className="font-medium">
                    {' '}
                    Document : {study.ethicsApprovalFileName}
                  </span>
                )}
              </p>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowConsent(false)} className="flex-1">
                  J&apos;accepte et je commence
                </Button>
                <Button variant="outline" onClick={handleExit} className="flex-1">
                  Refuser
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Finished screen
  if (finished) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h1 className="text-lg font-semibold">Simulation — {study.name}</h1>
          <Button variant="ghost" size="sm" onClick={handleExit}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-lg w-full text-center">
            <CardContent className="py-12 space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">
                Merci pour votre participation !
              </h2>
              <p className="text-muted-foreground">
                Vos réponses ont été enregistrées avec succès. Vous pouvez
                maintenant fermer cette fenêtre.
              </p>
              <Button onClick={handleExit} className="mt-4">
                Retour à l&apos;étude
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!current || totalQuestions === 0) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h1 className="text-lg font-semibold">Simulation — {study.name}</h1>
          <Button variant="ghost" size="sm" onClick={handleExit}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            Aucune question dans le protocole. Ajoutez des modules et questions
            d&apos;abord.
          </p>
        </div>
      </div>
    );
  }

  const q = current.question;
  const answer = answers[q.id] || '';

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-sm font-medium text-muted-foreground">
            {study.name}
          </h1>
          <Button variant="ghost" size="sm" onClick={handleExit}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {current.moduleName}
          </span>
          <span className="text-xs text-muted-foreground">
            {flatIdx + 1} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-6">
        <div className="max-w-xl w-full space-y-6">
          {/* Consigne */}
          <div className="space-y-2">
            {q.consigne.type === 'image' && (
              <div className="rounded-lg bg-muted h-48 flex items-center justify-center text-muted-foreground text-sm">
                [Image de consigne]
              </div>
            )}
            {q.consigne.type === 'video' && (
              <div className="rounded-lg bg-muted h-48 flex items-center justify-center text-muted-foreground">
                <Play className="h-8 w-8" />
              </div>
            )}
            <p className="text-lg font-medium">{q.label}</p>
            {q.consigne.content && (
              <p className="text-sm text-muted-foreground">
                {q.consigne.content}
              </p>
            )}
          </div>

          {/* Input based on type */}
          {q.type === 'qcm' && q.options && (
            <RadioGroup
              value={answer}
              onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}
            >
              {q.options.map((opt) => (
                <div
                  key={opt}
                  className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <RadioGroupItem value={opt} id={opt} />
                  <Label htmlFor={opt} className="flex-1 cursor-pointer">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {q.type === 'likert' && q.options && (
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  className={`w-full text-left rounded-lg border p-3 text-sm transition-colors ${
                    answer === opt
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <span className="font-medium mr-2">{i + 1}.</span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === 'texte' && (
            <Textarea
              placeholder="Votre réponse..."
              rows={4}
              value={answer}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            />
          )}

          {q.type === 'audio' && (
            <div className="flex flex-col items-center gap-4 rounded-lg border p-8">
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                <Mic className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Appuyez pour commencer l&apos;enregistrement
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  setAnswers({ ...answers, [q.id]: 'audio_recorded' })
                }
              >
                <Mic className="mr-2 h-4 w-4" />
                {answer ? 'Enregistré' : 'Enregistrer'}
              </Button>
            </div>
          )}

          {q.type === 'video' && (
            <div className="flex flex-col items-center gap-4 rounded-lg border p-8">
              <div className="h-48 w-full rounded-lg bg-muted flex items-center justify-center">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setAnswers({ ...answers, [q.id]: 'video_recorded' })
                }
              >
                <Video className="mr-2 h-4 w-4" />
                {answer ? 'Enregistré' : 'Démarrer la caméra'}
              </Button>
            </div>
          )}

          {q.type === 'video_visionnage' && (
            <div className="flex flex-col items-center gap-4 rounded-lg border p-8">
              <div className="h-48 w-full rounded-lg bg-muted flex items-center justify-center">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setAnswers({ ...answers, [q.id]: 'video_watched' })
                }
              >
                {answer ? 'Vidéo visionnée' : 'Lire la vidéo'}
              </Button>
            </div>
          )}

          {q.type === 'ia' && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>Conversation avec l&apos;assistant IA</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-auto">
                <div className="rounded-lg bg-muted p-3 text-sm max-w-[80%]">
                  Bonjour ! Comment allez-vous aujourd&apos;hui ? Parlez-moi de
                  votre semaine.
                </div>
                {answer && (
                  <div className="rounded-lg bg-indigo-50 p-3 text-sm max-w-[80%] ml-auto">
                    {answer}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Votre message..."
                  value={answer}
                  onChange={(e) =>
                    setAnswers({ ...answers, [q.id]: e.target.value })
                  }
                  onKeyDown={(e) => e.key === 'Enter' && goNext()}
                />
                <Button size="sm" variant="outline">
                  Envoyer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer navigation */}
      <div className="border-t px-6 py-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={flatIdx === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        <Button onClick={goNext}>
          {flatIdx === totalQuestions - 1 ? 'Terminer' : 'Suivant'}
          {flatIdx < totalQuestions - 1 && (
            <ArrowRight className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
