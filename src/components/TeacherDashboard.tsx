import { Database, Class } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Plus } from 'lucide-react';
import { getStudentsInClass, calculateClassAverage } from '@/lib/grades';

interface TeacherDashboardProps {
  db: Database;
  onOpenClass: (classId: string) => void;
  onCreateClass: () => void;
}

export function TeacherDashboard({ db, onOpenClass, onCreateClass }: TeacherDashboardProps) {
  const teacher = db.profiles.find(p => p.id === db.session.userId);
  const classes = db.classes.filter(c => c.teacherId === db.session.userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {teacher?.name}</h1>
          <p className="text-muted-foreground">Manage your classes and track student progress</p>
        </div>

        <div className="mb-6">
          <Button onClick={onCreateClass} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Class
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => {
            const students = getStudentsInClass(db, cls.id);
            const average = calculateClassAverage(db, cls.id);

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
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{students.length} students</span>
                    </div>
                    <div className="font-semibold">
                      Avg: {average !== null ? `${average.toFixed(1)}%` : '-'}
                    </div>
                  </div>
                  <Button onClick={() => onOpenClass(cls.id)} className="w-full">
                    Open Class
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
