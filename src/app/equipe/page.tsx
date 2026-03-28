'use client';

import { useEffect, useState } from 'react';
import { getTeam } from '@/lib/store';
import { TeamMember, ROLE_LABELS } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Mail } from 'lucide-react';
import { toast } from 'sonner';

const roleBadgeColors: Record<TeamMember['role'], string> = {
  chercheur_principal: 'bg-indigo-100 text-indigo-700',
  collaborateur: 'bg-emerald-100 text-emerald-700',
  assistant: 'bg-amber-100 text-amber-700',
};

export default function EquipePage() {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    setTeam(getTeam());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Équipe</h1>
          <p className="text-base text-muted-foreground mt-1">
            Membres de votre laboratoire
          </p>
        </div>
        <Button onClick={() => toast.info('Fonctionnalité à venir')}>
          <Plus className="mr-2 h-4 w-4" />
          Inviter un membre
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm shrink-0">
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-semibold text-sm truncate">
                    {member.name}
                  </h3>
                  <Badge className={`${roleBadgeColors[member.role]} text-xs`}>
                    {ROLE_LABELS[member.role]}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
