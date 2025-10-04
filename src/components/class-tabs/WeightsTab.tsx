import { useState } from 'react';
import { Database, generateId } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Pencil, Check, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCategoriesForClass } from '@/lib/grades';
import { toast } from 'sonner';
import { saveDB } from '@/lib/db';

interface WeightsTabProps {
  db: Database;
  classId: string;
  onUpdate: (db: Database) => void;
}

export function WeightsTab({ db, classId, onUpdate }: WeightsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const categories = getCategoriesForClass(db, classId);
  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);

  const handleAddCategory = () => {
    const newCategory = {
      id: generateId(),
      classId,
      name: 'New Category',
      weight: 0.1,
    };

    db.categories.push(newCategory);
    saveDB(db);
    onUpdate({ ...db });
    toast.success('Category added');
  };

  const startEdit = (category: any) => {
    setEditingId(category.id);
    setEditData({ ...category });
  };

  const saveEdit = () => {
    const category = db.categories.find(c => c.id === editingId);
    if (category) {
      Object.assign(category, editData);
      saveDB(db);
      onUpdate({ ...db });
      setEditingId(null);
      toast.success('Category updated');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (id: string) => {
    const hasAssignments = db.assignments.some(a => a.categoryId === id);
    if (hasAssignments) {
      toast.error('Cannot delete category with existing assignments');
      return;
    }

    db.categories = db.categories.filter(c => c.id !== id);
    saveDB(db);
    onUpdate({ ...db });
    toast.success('Category deleted');
  };

  return (
    <div className="space-y-6">
      {Math.abs(totalWeight - 1.0) > 0.01 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Warning: Total weight is {totalWeight.toFixed(2)}. It should equal 1.00 (100%).
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Grade Categories</CardTitle>
          <Button onClick={handleAddCategory} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const isEditing = editingId === category.id;
                const percentage = (category.weight * 100).toFixed(0);

                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      ) : (
                        <span className="font-medium">{category.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={editData.weight}
                          onChange={(e) => setEditData({ ...editData, weight: Number(e.target.value) })}
                          className="w-24"
                        />
                      ) : (
                        category.weight.toFixed(2)
                      )}
                    </TableCell>
                    <TableCell>{percentage}%</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={saveEdit}>
                              <Check className="h-4 w-4 text-accent" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={cancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => startEdit(category)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>Total</TableCell>
                <TableCell>{totalWeight.toFixed(2)}</TableCell>
                <TableCell>{(totalWeight * 100).toFixed(0)}%</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
