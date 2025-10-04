import { Database } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { byId } from '@/lib/db';
import { OverviewTab } from './class-tabs/OverviewTab';
import { StudentsTab } from './class-tabs/StudentsTab';
import { AssignmentsTab } from './class-tabs/AssignmentsTab';
import { GradebookTab } from './class-tabs/GradebookTab';
import { WeightsTab } from './class-tabs/WeightsTab';
import { AttendanceTab } from './class-tabs/AttendanceTab';
import { MaterialsTab } from './class-tabs/MaterialsTab';
import { GradeEstimatorTab } from './class-tabs/GradeEstimatorTab';
import { SettingsTab } from './class-tabs/SettingsTab';

interface ClassViewProps {
  db: Database;
  classId: string;
  onBack: () => void;
  onUpdate: (db: Database) => void;
}

export function ClassView({ db, classId, onBack, onUpdate }: ClassViewProps) {
  const cls = byId(db.classes, classId);
  const currentUser = byId(db.profiles, db.session.userId!);
  const isTeacher = currentUser?.role === 'teacher';

  if (!cls) {
    return <div>Class not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{cls.name}</h1>
            <p className="text-muted-foreground">{cls.section}</p>
          </div>
        </div>

        {isTeacher ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
              <TabsTrigger value="weights">Weights</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <OverviewTab db={db} classId={classId} />
            </TabsContent>
            
            <TabsContent value="students">
              <StudentsTab db={db} classId={classId} onUpdate={onUpdate} />
            </TabsContent>
            
            <TabsContent value="assignments">
              <AssignmentsTab db={db} classId={classId} onUpdate={onUpdate} />
            </TabsContent>
            
            <TabsContent value="gradebook">
              <GradebookTab db={db} classId={classId} onUpdate={onUpdate} />
            </TabsContent>
            
            <TabsContent value="weights">
              <WeightsTab db={db} classId={classId} onUpdate={onUpdate} />
            </TabsContent>
            
            <TabsContent value="attendance">
              <AttendanceTab db={db} classId={classId} onUpdate={onUpdate} />
            </TabsContent>
            
            <TabsContent value="materials">
              <MaterialsTab db={db} classId={classId} onUpdate={onUpdate} />
            </TabsContent>
            
            <TabsContent value="settings">
              <SettingsTab db={db} classId={classId} onUpdate={onUpdate} onBack={onBack} />
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="grades" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="grades">My Grades</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="estimator">Grade Estimator</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="info">Class Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grades">
              <GradebookTab db={db} classId={classId} onUpdate={onUpdate} />
            </TabsContent>
            
            <TabsContent value="assignments">
              <AssignmentsTab db={db} classId={classId} onUpdate={onUpdate} />
            </TabsContent>
            
            <TabsContent value="estimator">
              <GradeEstimatorTab db={db} classId={classId} />
            </TabsContent>
            
            <TabsContent value="materials">
              <MaterialsTab db={db} classId={classId} onUpdate={onUpdate} />
            </TabsContent>
            
            <TabsContent value="info">
              <OverviewTab db={db} classId={classId} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
