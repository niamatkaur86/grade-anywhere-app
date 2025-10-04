import { useState } from 'react';
import { Database, byId, createBlankDB } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { saveDB } from '@/lib/db';

interface SettingsTabProps {
  db: Database;
  classId: string;
  onUpdate: (db: Database) => void;
  onBack: () => void;
}

export function SettingsTab({ db, classId, onUpdate, onBack }: SettingsTabProps) {
  const cls = byId(db.classes, classId);
  const [name, setName] = useState(cls?.name || '');
  const [section, setSection] = useState(cls?.section || '');

  const handleSaveClassInfo = () => {
    if (cls) {
      cls.name = name;
      cls.section = section;
      saveDB(db);
      onUpdate({ ...db });
      toast.success('Class information updated');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(db, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gradebook_${classId}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        saveDB(imported);
        onUpdate(imported);
        toast.success('Data imported successfully');
      } catch (error) {
        toast.error('Failed to import data');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure? This will delete all data and reset to demo data.')) {
      const newDb = createBlankDB();
      onUpdate(newDb);
      onBack();
      toast.success('Data reset to demo state');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
          <CardDescription>Update class name and section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="className">Class Name</Label>
            <Input
              id="className"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Input
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveClassInfo} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export, import, or reset your gradebook data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleExport} variant="outline" className="w-full gap-2">
            <Download className="h-4 w-4" />
            Export All Data (JSON)
          </Button>
          
          <div>
            <Input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <Label htmlFor="import-file">
              <Button variant="outline" className="w-full gap-2" asChild>
                <span>
                  <Upload className="h-4 w-4" />
                  Import Data from JSON
                </span>
              </Button>
            </Label>
          </div>

          <Button onClick={handleReset} variant="destructive" className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset to Demo Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
