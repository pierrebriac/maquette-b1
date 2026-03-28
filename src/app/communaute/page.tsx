'use client';

import { useEffect, useState } from 'react';
import { getCommunity } from '@/lib/store';
import { CommunityItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Download,
  Database,
  FileText,
  Brain,
  Tag,
  Calendar,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

const typeConfig: Record<
  CommunityItem['type'],
  { label: string; icon: React.ReactNode; color: string }
> = {
  dataset: {
    label: 'Dataset',
    icon: <Database className="h-4 w-4" />,
    color: 'bg-emerald-100 text-emerald-700',
  },
  protocole: {
    label: 'Protocole',
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-700',
  },
  modele: {
    label: 'Modèle IA',
    icon: <Brain className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-700',
  },
};

export default function CommunautePage() {
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CommunityItem['type'] | 'all'>(
    'all'
  );

  useEffect(() => {
    setItems(getCommunity());
  }, []);

  const filtered = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'all' || item.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communauté</h1>
        <p className="text-base text-muted-foreground mt-1">
          Datasets, protocoles et modèles partagés par la communauté
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {(
            [
              { key: 'all', label: 'Tous' },
              { key: 'dataset', label: 'Datasets' },
              { key: 'protocole', label: 'Protocoles' },
              { key: 'modele', label: 'Modèles' },
            ] as const
          ).map((f) => (
            <Button
              key={f.key}
              variant={typeFilter === f.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const config = typeConfig[item.type];
          return (
            <Card
              key={item.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <Badge className={`${config.color} gap-1`}>
                    {config.icon}
                    {config.label}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Download className="h-3 w-3" />
                    {item.downloads}
                  </div>
                </div>

                <h3 className="font-semibold text-base">{item.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.createdAt).toLocaleDateString('fr-CA')}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => toast.success(`"${item.name}" ajouté à votre espace`)}
                >
                  <Download className="mr-2 h-3 w-3" />
                  {item.type === 'protocole'
                    ? 'Importer le protocole'
                    : 'Télécharger'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun résultat</p>
        </div>
      )}
    </div>
  );
}
