import { useState } from 'react';
import { Database, generateId, byId } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { getAssignmentsForClass, getCategoriesForClass } from '@/lib/grades';
import { toast } from 'sonner';
import { saveDB } from '@/lib/db';

interface AssignmentsTabProps {
  db: Database;
  classId: string;
  onUpdate: (db: Database) => void;
}

export function AssignmentsTab({ db, classId, onUpdate }: AssignmentsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const assignments = getAssignmentsForClass(db, classId);
  const categories = getCategoriesForClass(db, classId);
  const currentUser = byId(db.profiles, db.session.userId!);
  const isTeacher = currentUser?.role === 'teacher';

  const handleAddAssignment = () => {
    if (categories.length === 0) {
      toast.error('Please add at least one category first');
      return;
    }

    const newAssignment = {
      id: generateId(),
      classId,
      categoryId: categories[0].id,
      title: 'New Assignment',
      points: 100,
      dueDate: new Date().toISOString().split('T')[0],
    };

    db.assignments.push(newAssignment);
    saveDB(db);
    onUpdate({ ...db });
    toast.success('Assignment added');
  };

  const startEdit = (assignment: any) => {
    setEditingId(assignment.id);
    setEditData({ ...assignment });
  };

  const saveEdit = () => {
    const assignment = db.assignments.find(a => a.id === editingId);
    if (assignment) {
      Object.assign(assignment, editData);
      saveDB(db);
      onUpdate({ ...db });
      setEditingId(null);
      toast.success('Assignment updated');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (id: string) => {
    db.assignments = db.assignments.filter(a => a.id !== id);
    db.grades = db.grades.filter(g => g.assignmentId !== id);
    saveDB(db);
    onUpdate({ ...db });
    toast.success('Assignment deleted');
  };

  if (!isTeacher) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => {
                const category = byId(db.categories, assignment.categoryId);
                return (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>{category?.name}</TableCell>
                    <TableCell>{assignment.points}</TableCell>
                    <TableCell>{assignment.dueDate}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Assignments ({assignments.length})</CardTitle>
          <Button onClick={handleAddAssignment} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Assignment
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => {
                const isEditing = editingId === assignment.id;
                const category = byId(db.categories, assignment.categoryId);

                return (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        />
                      ) : (
                        <span className="font-medium">{assignment.title}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={editData.categoryId}
                          onValueChange={(value) => setEditData({ ...editData, categoryId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        category?.name
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editData.points}
                          onChange={(e) => setEditData({ ...editData, points: Number(e.target.value) })}
                          className="w-20"
                        />
                      ) : (
                        assignment.points
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editData.dueDate}
                          onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                        />
                      ) : (
                        assignment.dueDate
                      )}
                    </TableCell>
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
                            <Button variant="ghost" size="icon" onClick={() => startEdit(assignment)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(assignment.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
