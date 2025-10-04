import { Database } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp } from 'lucide-react';
import { calculateWeightedAverage, getLetterGrade } from '@/lib/grades';
import { byId } from '@/lib/db';

interface StudentDashboardProps {
  db: Database;
  onOpenClass: (classId: string) => void;
}

export function StudentDashboard({ db, onOpenClass }: StudentDashboardProps) {
  const student = db.profiles.find(p => p.id === db.session.userId);
  const enrollments = db.enrollments.filter(e => e.studentId === db.session.userId);
  const enrolledClasses = enrollments
    .map(e => byId(db.classes, e.classId))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {student?.name}</h1>
          <p className="text-muted-foreground">View your classes and grades</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledClasses.map((cls) => {
            if (!cls) return null;
            const average = calculateWeightedAverage(db, student!.id, cls.id);
            const letter = getLetterGrade(average);
            const teacher = byId(db.profiles, cls.teacherId);

            return (
              <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>{cls.name}</CardTitle>
                        <CardDescription>{cls.section}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {teacher?.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <span className="text-2xl font-bold">
                        {average !== null ? `${average.toFixed(1)}%` : '-'}
                      </span>
                      <span className="text-lg font-semibold text-muted-foreground">
                        ({letter})
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => onOpenClass(cls.id)} className="w-full">
                    View Class
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
