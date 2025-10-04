import { useState } from 'react';
import { Database, generateId, byId } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, ExternalLink, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { saveDB } from '@/lib/db';

interface MaterialsTabProps {
  db: Database;
  classId: string;
  onUpdate: (db: Database) => void;
}

export function MaterialsTab({ db, classId, onUpdate }: MaterialsTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const materials = db.studyMaterials.filter(m => m.classId === classId);
  const currentUser = byId(db.profiles, db.session.userId!);
  const isTeacher = currentUser?.role === 'teacher';

  const handleAddMaterial = () => {
    if (!title.trim() || !url.trim()) {
      toast.error('Please provide title and URL');
      return;
    }

    db.studyMaterials.push({
      id: generateId(),
      classId,
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      uploadDate: new Date().toISOString().split('T')[0],
    });

    saveDB(db);
    onUpdate({ ...db });
    setTitle('');
    setDescription('');
    setUrl('');
    setIsAdding(false);
    toast.success('Study material added');
  };

  const handleDelete = (id: string) => {
    db.studyMaterials = db.studyMaterials.filter(m => m.id !== id);
    saveDB(db);
    onUpdate({ ...db });
    toast.success('Material deleted');
  };

  return (
    <div className="space-y-6">
      {isTeacher && isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add Study Material</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="URL (link to document, video, etc.)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddMaterial}>Add Material</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Study Materials ({materials.length})</CardTitle>
          {isTeacher && !isAdding && (
            <Button onClick={() => setIsAdding(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Material
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No study materials yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {material.description || '-'}
                    </TableCell>
                    <TableCell>{material.uploadDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(material.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {isTeacher && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(material.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
