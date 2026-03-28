'use client';

import { useEffect, useState } from 'react';
import { getStudies } from '@/lib/store';
import { Study, STATUS_LABELS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FlaskConical,
  Users,
  BarChart3,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [studies, setStudies] = useState<Study[]>([]);

  useEffect(() => {
    setStudies(getStudies());
  }, []);

  const activeStudies = studies.filter((s) => s.status === 'publiee');
  const totalRecruited = studies.reduce((sum, s) => sum + s.recruitedCount, 0);
  const totalTarget = studies.reduce((sum, s) => sum + s.recruitmentTarget, 0);

  const pendingModifications = [
    {
      id: '1',
      study: 'Détection précoce de la dépression par la voix',
      author: 'Alexandre Tremblay',
      description: 'Ajout du module "Évaluation GAD-7" au protocole',
      date: '26 mars 2026',
    },
    {
      id: '2',
      study: 'Suivi cognitif post-AVC',
      author: 'Marie-Claire Dupont',
      description: 'Modification de la consigne du test de mémoire',
      date: '25 mars 2026',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-base text-muted-foreground mt-1">
          Vue d&apos;ensemble de vos études et du recrutement
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-normal">
              Études totales
            </CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studies.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeStudies.length} en cours de recrutement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-normal">
              Participants recrutés
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRecruited}</div>
            <p className="text-xs text-muted-foreground">
              sur {totalTarget} visés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-normal">
              Taux de complétion
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalTarget > 0
                ? Math.round((totalRecruited / totalTarget) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              toutes études confondues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-normal">
              Modifications en attente
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {pendingModifications.length}
            </div>
            <p className="text-xs text-muted-foreground">à valider</p>
          </CardContent>
        </Card>
      </div>

      {/* Active studies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Études en cours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {studies.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune étude</p>
          )}
          {studies.map((study) => (
            <Link
              key={study.id}
              href={`/etudes/${study.id}`}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-base truncate">{study.name}</span>
                  <Badge
                    variant={
                      study.status === 'publiee'
                        ? 'default'
                        : study.status === 'terminee'
                          ? 'secondary'
                          : 'outline'
                    }
                    className={
                      study.status === 'publiee'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                        : study.status === 'terminee'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                          : ''
                    }
                  >
                    {STATUS_LABELS[study.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {study.recruitedCount}/{study.recruitmentTarget} participants
                  </span>
                  <span>v{study.protocol.version}</span>
                </div>
                {study.recruitmentTarget > 0 && (
                  <Progress
                    value={
                      (study.recruitedCount / study.recruitmentTarget) * 100
                    }
                    className="mt-2 h-1.5"
                  />
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-4 shrink-0" />
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Pending modifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Modifications à valider</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingModifications.map((mod) => (
            <div
              key={mod.id}
              className="flex items-start justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium text-sm">{mod.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mod.study} — par {mod.author} le {mod.date}
                </p>
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button className="rounded-md bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors">
                  Valider
                </button>
                <button className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors">
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
