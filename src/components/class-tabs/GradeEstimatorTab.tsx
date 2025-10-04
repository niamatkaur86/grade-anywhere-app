import { useState, useEffect } from 'react';
import { Database, byId } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, TrendingUp } from 'lucide-react';
import { getAssignmentsForClass, getCategoriesForClass, getLetterGrade } from '@/lib/grades';

interface GradeEstimatorTabProps {
  db: Database;
  classId: string;
}

export function GradeEstimatorTab({ db, classId }: GradeEstimatorTabProps) {
  const currentUser = byId(db.profiles, db.session.userId!);
  const assignments = getAssignmentsForClass(db, classId);
  const categories = getCategoriesForClass(db, classId);
  
  // Initialize hypothetical scores with actual grades
  const [hypotheticalScores, setHypotheticalScores] = useState<{ [key: string]: number | null }>({});

  useEffect(() => {
    const scores: { [key: string]: number | null } = {};
    assignments.forEach(assignment => {
      const grade = db.grades.find(
        g => g.assignmentId === assignment.id && g.studentId === currentUser?.id
      );
      scores[assignment.id] = grade?.score ?? null;
    });
    setHypotheticalScores(scores);
  }, [assignments, db.grades, currentUser]);

  const calculateEstimatedGrade = (): number | null => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const category of categories) {
      const categoryAssignments = assignments.filter(a => a.categoryId === category.id);
      if (categoryAssignments.length === 0) continue;

      let earnedPoints = 0;
      let possiblePoints = 0;
      let hasGrades = false;

      for (const assignment of categoryAssignments) {
        const score = hypotheticalScores[assignment.id];
        if (score !== null && score !== undefined) {
          earnedPoints += score;
          possiblePoints += assignment.points;
          hasGrades = true;
        }
      }

      if (hasGrades && possiblePoints > 0) {
        const categoryPercent = earnedPoints / possiblePoints;
        totalWeightedScore += categoryPercent * category.weight;
        totalWeight += category.weight;
      }
    }

    if (totalWeight === 0) return null;
    return (totalWeightedScore / totalWeight) * 100;
  };

  const handleScoreChange = (assignmentId: string, value: string) => {
    const score = value === '' ? null : Number(value);
    setHypotheticalScores(prev => ({
      ...prev,
      [assignmentId]: score,
    }));
  };

  const estimatedGrade = calculateEstimatedGrade();
  const letter = getLetterGrade(estimatedGrade);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Grade Estimator</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter hypothetical scores to see how they would affect your grade
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">Estimated Grade:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">
                  {estimatedGrade !== null ? `${estimatedGrade.toFixed(1)}%` : '-'}
                </span>
                <span className="text-xl font-semibold text-muted-foreground">
                  ({letter})
                </span>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actual Score</TableHead>
                <TableHead>Hypothetical Score</TableHead>
                <TableHead>Possible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => {
                const category = byId(db.categories, assignment.categoryId);
                const actualGrade = db.grades.find(
                  g => g.assignmentId === assignment.id && g.studentId === currentUser?.id
                );
                const actualScore = actualGrade?.score;

                return (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>{category?.name}</TableCell>
                    <TableCell>
                      {actualScore !== null && actualScore !== undefined ? actualScore : '-'}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={assignment.points}
                        value={hypotheticalScores[assignment.id] ?? ''}
                        onChange={(e) => handleScoreChange(assignment.id, e.target.value)}
                        className="w-24"
                        placeholder="Enter..."
                      />
                    </TableCell>
                    <TableCell>{assignment.points}</TableCell>
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
