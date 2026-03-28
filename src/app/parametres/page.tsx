'use client';

import { useEffect, useState } from 'react';
import { getSettings, saveSettings, resetAllData } from '@/lib/store';
import { LabSettings } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function ParametresPage() {
  const [settings, setSettings] = useState<LabSettings>({
    labName: '',
    email: '',
    timezone: '',
  });

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  function handleSave() {
    saveSettings(settings);
    toast.success('Paramètres enregistrés');
  }

  function handleReset() {
    if (
      confirm(
        'Réinitialiser toutes les données ? Cette action remettra la maquette dans son état initial.'
      )
    ) {
      resetAllData();
      setSettings(getSettings());
      toast.success('Données réinitialisées');
      window.location.href = '/';
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-base text-muted-foreground mt-1">
          Configuration de votre compte et laboratoire
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Laboratoire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="labName">Nom du laboratoire</Label>
            <Input
              id="labName"
              value={settings.labName}
              onChange={(e) =>
                setSettings({ ...settings, labName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email de contact</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) =>
                setSettings({ ...settings, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tz">Fuseau horaire</Label>
            <Input
              id="tz"
              value={settings.timezone}
              onChange={(e) =>
                setSettings({ ...settings, timezone: e.target.value })
              }
            />
          </div>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Réinitialiser toutes les données de la maquette à leur état initial.
            Cette action est irréversible.
          </p>
          <Button variant="destructive" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser les données
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
