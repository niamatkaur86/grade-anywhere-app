import { Database, byId } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudentsInClass, getAssignmentsForClass, calculateWeightedAverage, getLetterGrade } from '@/lib/grades';
import { toast } from 'sonner';
import { saveDB } from '@/lib/db';

interface GradebookTabProps {
  db: Database;
  classId: string;
  onUpdate: (db: Database) => void;
}

export function GradebookTab({ db, classId, onUpdate }: GradebookTabProps) {
  const students = getStudentsInClass(db, classId);
  const assignments = getAssignmentsForClass(db, classId);
  const currentUser = byId(db.profiles, db.session.userId!);
  const isTeacher = currentUser?.role === 'teacher';

  const handleGradeChange = (studentId: string, assignmentId: string, value: string) => {
    const score = value === '' ? null : Number(value);
    let grade = db.grades.find(g => g.assignmentId === assignmentId && g.studentId === studentId);

    if (grade) {
      grade.score = score;
    } else {
      db.grades.push({
        id: `grade_${Date.now()}_${Math.random()}`,
        assignmentId,
        studentId,
        score,
      });
    }

    saveDB(db);
    onUpdate({ ...db });
    toast.success('Grade saved');
  };

  const getGrade = (studentId: string, assignmentId: string) => {
    const grade = db.grades.find(g => g.assignmentId === assignmentId && g.studentId === studentId);
    return grade?.score;
  };

  if (!isTeacher) {
    // Student view - only show their own grades
    const student = currentUser;
    if (!student) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>My Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Earned</TableHead>
                <TableHead>Possible</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => {
                const category = byId(db.categories, assignment.categoryId);
                const score = getGrade(student.id, assignment.id);
                const percentage = score !== null && score !== undefined
                  ? ((score / assignment.points) * 100).toFixed(1)
                  : '-';

                return (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>{category?.name}</TableCell>
                    <TableCell>{score ?? '-'}</TableCell>
                    <TableCell>{assignment.points}</TableCell>
                    <TableCell>{percentage !== '-' ? `${percentage}%` : '-'}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={4}>Overall Average</TableCell>
                <TableCell>
                  {(() => {
                    const avg = calculateWeightedAverage(db, student.id, classId);
                    const letter = getLetterGrade(avg);
                    return avg !== null ? `${avg.toFixed(1)}% (${letter})` : '-';
                  })()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gradebook</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-10">Student</TableHead>
              {assignments.map((assignment) => (
                <TableHead key={assignment.id} className="min-w-[100px]">
                  <div className="text-xs">{assignment.title}</div>
                  <div className="text-xs text-muted-foreground">({assignment.points} pts)</div>
                </TableHead>
              ))}
              <TableHead className="min-w-[120px]">Average</TableHead>
              <TableHead>Letter</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              if (!student) return null;
              const average = calculateWeightedAverage(db, student.id, classId);
              const letter = getLetterGrade(average);

              return (
                <TableRow key={student.id}>
                  <TableCell className="sticky left-0 bg-background z-10 font-medium">
                    {student.name}
                  </TableCell>
                  {assignments.map((assignment) => {
                    const grade = getGrade(student.id, assignment.id);
                    return (
                      <TableCell key={assignment.id}>
                        <Input
                          type="number"
                          min="0"
                          max={assignment.points}
                          value={grade ?? ''}
                          onChange={(e) => handleGradeChange(student.id, assignment.id, e.target.value)}
                          className="w-20"
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell className="font-semibold">
                    {average !== null ? `${average.toFixed(1)}%` : '-'}
                  </TableCell>
                  <TableCell className="font-semibold">{letter}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
