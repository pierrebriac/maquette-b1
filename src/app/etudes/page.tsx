'use client';

import { useEffect, useState, useRef } from 'react';
import { getStudies, saveStudy } from '@/lib/store';
import { Study, STATUS_LABELS, StudyStatus } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Search, Upload, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const statusColors: Record<StudyStatus, string> = {
  brouillon: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  publiee: 'bg-green-100 text-green-700 hover:bg-green-100',
  terminee: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
};

export default function EtudesPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudyStatus | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStudies(getStudies());
  }, []);

  const filtered = studies.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleImportProtocol(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const newStudy: Study = {
          id: uuidv4(),
          name: data.name || 'Étude importée',
          description: data.description || '',
          tags: data.tags || [],
          status: 'brouillon',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          consentConfigured: false,
          recruitmentTarget: data.recruitmentTarget || 0,
          recruitedCount: 0,
          protocol: data.protocol || {
            id: uuidv4(),
            version: '1.0',
            modules: [],
          },
        };
        saveStudy(newStudy);
        setStudies(getStudies());
        toast.success('Protocole importé avec succès');
      } catch {
        toast.error("Erreur lors de l'import du fichier JSON");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes études</h1>
          <p className="text-base text-muted-foreground mt-1">
            {studies.length} étude{studies.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportProtocol}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </Button>
          <Link href="/etudes/nouvelle">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle étude
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou tag..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'brouillon', 'publiee', 'terminee'] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'Toutes' : STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      </div>

      {/* Study cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((study) => (
          <Link key={study.id} href={`/etudes/${study.id}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-base leading-tight line-clamp-2 flex-1">
                    {study.name}
                  </h3>
                  <Badge className={`ml-2 shrink-0 ${statusColors[study.status]}`}>
                    {STATUS_LABELS[study.status]}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {study.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {study.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                  {study.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{study.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {study.recruitedCount}/{study.recruitmentTarget}{' '}
                      participants
                    </span>
                    <span>
                      {study.recruitmentTarget > 0
                        ? Math.round(
                            (study.recruitedCount / study.recruitmentTarget) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      study.recruitmentTarget > 0
                        ? (study.recruitedCount / study.recruitmentTarget) * 100
                        : 0
                    }
                    className="h-1.5"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(study.updatedAt).toLocaleDateString('fr-CA')}
                  </span>
                  <span className="ml-auto">
                    v{study.protocol.version} ·{' '}
                    {study.protocol.modules.length} module
                    {study.protocol.modules.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune étude trouvée</p>
        </div>
      )}
    </div>
  );
}
