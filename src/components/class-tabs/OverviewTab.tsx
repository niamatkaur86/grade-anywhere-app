import { Database, byId } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Award } from 'lucide-react';
import { getStudentsInClass, getAssignmentsForClass, calculateClassAverage } from '@/lib/grades';

interface OverviewTabProps {
  db: Database;
  classId: string;
}

export function OverviewTab({ db, classId }: OverviewTabProps) {
  const cls = byId(db.classes, classId);
  const teacher = cls ? byId(db.profiles, cls.teacherId) : null;
  const students = getStudentsInClass(db, classId);
  const assignments = getAssignmentsForClass(db, classId);
  const average = calculateClassAverage(db, classId);
  const currentUser = byId(db.profiles, db.session.userId!);
  const isTeacher = currentUser?.role === 'teacher';

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {average !== null ? `${average.toFixed(1)}%` : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Class Name</span>
            <span className="font-medium">{cls?.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Section</span>
            <span className="font-medium">{cls?.section}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Teacher</span>
            <span className="font-medium">{teacher?.name}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
