'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveStudy } from '@/lib/store';
import { Study } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export default function NouvelleEtudePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [recruitmentTarget, setRecruitmentTarget] = useState(50);
  const [ethicsFileName, setEthicsFileName] = useState('');
  const [consentConfigured, setConsentConfigured] = useState(false);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleCreate() {
    const study: Study = {
      id: uuidv4(),
      name,
      description,
      tags,
      status: 'brouillon',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ethicsApprovalFileName: ethicsFileName || undefined,
      consentConfigured,
      recruitmentTarget,
      recruitedCount: 0,
      inclusionCriteria: [],
      exclusionCriteria: [],
      protocol: {
        id: uuidv4(),
        version: '1.0',
        modules: [],
      },
    };
    saveStudy(study);
    toast.success('Étude créée avec succès');
    router.push(`/etudes/${study.id}`);
  }

  const steps = [
    'Informations générales',
    'Éthique & Consentement',
    'Résumé',
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/etudes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nouvelle étude</h1>
          <p className="text-muted-foreground">
            Étape {step + 1} sur {steps.length} — {steps[step]}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${
              i <= step ? 'bg-indigo-600' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step 1: General info */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l&apos;étude *</Label>
              <Input
                id="name"
                placeholder="Ex: Détection de la dépression par la voix"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                placeholder="Décrivez l'objectif de votre étude..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button variant="outline" onClick={addTag}>
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Objectif de recrutement</Label>
              <Input
                id="target"
                type="number"
                min={0}
                value={recruitmentTarget}
                onChange={(e) =>
                  setRecruitmentTarget(parseInt(e.target.value) || 0)
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Ethics */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Éthique & Consentement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Approbation éthique (PDF)</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const fileName = prompt(
                      'Nom du fichier PDF d\'approbation éthique :',
                      'approbation_ethique.pdf'
                    );
                    if (fileName) setEthicsFileName(fileName);
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Charger le PDF
                </Button>
                {ethicsFileName && (
                  <span className="text-sm text-muted-foreground">
                    {ethicsFileName}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Le PDF d&apos;approbation du comité d&apos;éthique est requis avant de
                publier l&apos;étude.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>Consentement configuré</Label>
                <p className="text-xs text-muted-foreground">
                  Le formulaire de consentement doit être configuré avant le
                  lancement
                </p>
              </div>
              <Switch
                checked={consentConfigured}
                onCheckedChange={setConsentConfigured}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Summary */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-muted-foreground">Nom</div>
              <div className="font-medium">{name || '—'}</div>
              <div className="text-muted-foreground">Description</div>
              <div className="font-medium line-clamp-2">
                {description || '—'}
              </div>
              <div className="text-muted-foreground">Tags</div>
              <div className="flex flex-wrap gap-1">
                {tags.length > 0
                  ? tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))
                  : '—'}
              </div>
              <div className="text-muted-foreground">
                Objectif recrutement
              </div>
              <div className="font-medium">{recruitmentTarget} participants</div>
              <div className="text-muted-foreground">Approbation éthique</div>
              <div className="font-medium">
                {ethicsFileName || 'Non configurée'}
              </div>
              <div className="text-muted-foreground">Consentement</div>
              <div className="font-medium">
                {consentConfigured ? 'Configuré' : 'Non configuré'}
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              L&apos;étude sera créée en statut &quot;Brouillon&quot;. Vous pourrez ensuite
              construire le protocole et la publier.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => (step > 0 ? setStep(step - 1) : router.push('/etudes'))}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step > 0 ? 'Précédent' : 'Annuler'}
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={step === 0 && !name.trim()}>
            Suivant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={!name.trim()}>
            <Check className="mr-2 h-4 w-4" />
            Créer l&apos;étude
          </Button>
        )}
      </div>
    </div>
  );
}
