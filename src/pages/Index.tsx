import { useState, useEffect } from 'react';
import { Database, loadDB, saveDB } from '@/lib/db';
import { Login } from '@/components/Login';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { StudentDashboard } from '@/components/StudentDashboard';
import { ClassView } from '@/components/ClassView';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { byId, generateId } from '@/lib/db';

const Index = () => {
  const [db, setDb] = useState<Database>(loadDB());
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);

  const currentUser = db.session.userId ? byId(db.profiles, db.session.userId) : null;

  const handleLogin = (userId: string) => {
    db.session.userId = userId;
    saveDB(db);
    setDb({ ...db });
  };

  const handleLogout = () => {
    db.session.userId = null;
    saveDB(db);
    setDb({ ...db });
    setCurrentClassId(null);
    toast.success('Logged out successfully');
  };

  const handleCreateClass = () => {
    const newClass = {
      id: generateId(),
      name: 'New Class',
      section: 'Section 1',
      teacherId: db.session.userId!,
    };
    db.classes.push(newClass);
    saveDB(db);
    setDb({ ...db });
    setCurrentClassId(newClass.id);
    toast.success('Class created');
  };

  const handleUpdate = (updatedDb: Database) => {
    setDb(updatedDb);
  };

  const handleDeleteClass = (classId: string) => {
    if (currentClassId === classId) {
      setCurrentClassId(null);
    }
    setDb({ ...db });
  };

  if (!db.session.userId) {
    return <Login db={db} onLogin={handleLogin} />;
  }

  if (currentClassId) {
    return (
      <ClassView
        db={db}
        classId={currentClassId}
        onBack={() => setCurrentClassId(null)}
        onUpdate={handleUpdate}
      />
    );
  }

  return (
    <div>
      <div className="fixed top-4 right-4 z-50">
        <Button onClick={handleLogout} variant="outline" className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {currentUser?.role === 'teacher' ? (
        <TeacherDashboard
          db={db}
          onOpenClass={setCurrentClassId}
          onCreateClass={handleCreateClass}
          onDeleteClass={handleDeleteClass}
        />
      ) : (
        <StudentDashboard
          db={db}
          onOpenClass={setCurrentClassId}
        />
      )}
    </div>
  );
};

export default Index;
