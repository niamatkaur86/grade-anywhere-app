import { useState } from 'react';
import { Database, generateId, byId } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Trash2 } from 'lucide-react';
import { getStudentsInClass, calculateWeightedAverage, getLetterGrade } from '@/lib/grades';
import { toast } from 'sonner';
import { saveDB } from '@/lib/db';

interface StudentsTabProps {
  db: Database;
  classId: string;
  onUpdate: (db: Database) => void;
}

export function StudentsTab({ db, classId, onUpdate }: StudentsTabProps) {
  const [newEmail, setNewEmail] = useState('');
  const students = getStudentsInClass(db, classId);

  const handleAddStudent = () => {
    const student = db.profiles.find(p => p.email === newEmail && p.role === 'student');
    if (!student) {
      toast.error('Student not found with that email');
      return;
    }

    const existing = db.enrollments.find(
      e => e.studentId === student.id && e.classId === classId
    );
    if (existing) {
      toast.error('Student is already enrolled');
      return;
    }

    db.enrollments.push({
      id: generateId(),
      studentId: student.id,
      classId,
    });

    saveDB(db);
    onUpdate({ ...db });
    setNewEmail('');
    toast.success('Student added successfully');
  };

  const handleRemoveStudent = (studentId: string) => {
    db.enrollments = db.enrollments.filter(
      e => !(e.studentId === studentId && e.classId === classId)
    );
    saveDB(db);
    onUpdate({ ...db });
    toast.success('Student removed from class');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Student</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="student@email.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Button onClick={handleAddStudent} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Grade</TableHead>
                <TableHead>Letter</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                if (!student) return null;
                const average = calculateWeightedAverage(db, student.id, classId);
                const letter = getLetterGrade(average);

                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      {average !== null ? `${average.toFixed(1)}%` : '-'}
                    </TableCell>
                    <TableCell>{letter}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStudent(student.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
