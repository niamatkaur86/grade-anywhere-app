import { Database, Class } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Plus, Trash2 } from 'lucide-react';
import { getStudentsInClass, calculateClassAverage } from '@/lib/grades';
import { toast } from 'sonner';
import { saveDB } from '@/lib/db';

interface TeacherDashboardProps {
  db: Database;
  onOpenClass: (classId: string) => void;
  onCreateClass: () => void;
  onDeleteClass?: (classId: string) => void;
}

export function TeacherDashboard({ db, onOpenClass, onCreateClass, onDeleteClass }: TeacherDashboardProps) {
  const teacher = db.profiles.find(p => p.id === db.session.userId);
  const classes = db.classes.filter(c => c.teacherId === db.session.userId);

  const handleDeleteClass = (classId: string, className: string) => {
    if (!confirm(`Are you sure you want to delete "${className}"? This will remove all students, assignments, and grades associated with this class.`)) {
      return;
    }

    // Remove class
    db.classes = db.classes.filter(c => c.id !== classId);
    
    // Remove enrollments
    db.enrollments = db.enrollments.filter(e => e.classId !== classId);
    
    // Remove categories
    const categoryIds = db.categories.filter(c => c.classId === classId).map(c => c.id);
    db.categories = db.categories.filter(c => c.classId !== classId);
    
    // Remove assignments
    const assignmentIds = db.assignments.filter(a => a.classId === classId).map(a => a.id);
    db.assignments = db.assignments.filter(a => a.classId !== classId);
    
    // Remove grades
    db.grades = db.grades.filter(g => !assignmentIds.includes(g.assignmentId));
    
    // Remove attendance
    db.attendance = db.attendance.filter(a => a.classId !== classId);
    
    // Remove study materials
    db.studyMaterials = db.studyMaterials.filter(s => s.classId !== classId);
    
    saveDB(db);
    if (onDeleteClass) onDeleteClass(classId);
    toast.success('Class deleted successfully');
  };

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
                  <div className="flex gap-2">
                    <Button onClick={() => onOpenClass(cls.id)} className="flex-1">
                      Open Class
                    </Button>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(cls.id, cls.name);
                      }} 
                      variant="destructive" 
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
