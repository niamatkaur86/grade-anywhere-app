export interface Profile {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'teacher' | 'student';
}

export interface Class {
  id: string;
  name: string;
  section: string;
  teacherId: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
}

export interface Category {
  id: string;
  classId: string;
  name: string;
  weight: number;
}

export interface Assignment {
  id: string;
  classId: string;
  categoryId: string;
  title: string;
  points: number;
  dueDate: string;
}

export interface Grade {
  id: string;
  assignmentId: string;
  studentId: string;
  score: number | null;
}

export interface Attendance {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface StudyMaterial {
  id: string;
  classId: string;
  title: string;
  description: string;
  url: string;
  uploadDate: string;
}

export interface Session {
  userId: string | null;
}

export interface Database {
  profiles: Profile[];
  classes: Class[];
  enrollments: Enrollment[];
  categories: Category[];
  assignments: Assignment[];
  grades: Grade[];
  attendance: Attendance[];
  studyMaterials: StudyMaterial[];
  session: Session;
}

const DB_KEY = 'gradebook_data';

export function loadDB(): Database {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return createBlankDB();
}

export function saveDB(db: Database): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function createBlankDB(): Database {
  const teacherId = 'teacher1';
  const studentIds = ['student1', 'student2', 'student3', 'student4'];
  const classIds = ['class1', 'class2'];
  const categoryIds = ['cat1', 'cat2', 'cat3', 'cat4'];
  const assignmentIds = ['assign1', 'assign2', 'assign3', 'assign4', 'assign5', 'assign6'];

  const db: Database = {
    profiles: [
      { id: teacherId, email: 'teacher@demo', password: 'demo', name: 'Ms. Johnson', role: 'teacher' },
      { id: studentIds[0], email: 'student@demo', password: 'demo', name: 'Alex Chen', role: 'student' },
      { id: studentIds[1], email: 'student2@demo', password: 'demo', name: 'Jordan Smith', role: 'student' },
      { id: studentIds[2], email: 'student3@demo', password: 'demo', name: 'Taylor Brown', role: 'student' },
      { id: studentIds[3], email: 'student4@demo', password: 'demo', name: 'Morgan Davis', role: 'student' },
    ],
    classes: [
      { id: classIds[0], name: 'Algebra I', section: 'Period 2', teacherId },
      { id: classIds[1], name: 'Biology', section: 'Period 4', teacherId },
    ],
    enrollments: [
      { id: 'enroll1', studentId: studentIds[0], classId: classIds[0] },
      { id: 'enroll2', studentId: studentIds[1], classId: classIds[0] },
      { id: 'enroll3', studentId: studentIds[2], classId: classIds[0] },
      { id: 'enroll4', studentId: studentIds[0], classId: classIds[1] },
      { id: 'enroll5', studentId: studentIds[3], classId: classIds[1] },
    ],
    categories: [
      { id: categoryIds[0], classId: classIds[0], name: 'Homework', weight: 0.3 },
      { id: categoryIds[1], classId: classIds[0], name: 'Tests', weight: 0.5 },
      { id: categoryIds[2], classId: classIds[1], name: 'Labs', weight: 0.4 },
      { id: categoryIds[3], classId: classIds[1], name: 'Exams', weight: 0.6 },
    ],
    assignments: [
      { id: assignmentIds[0], classId: classIds[0], categoryId: categoryIds[0], title: 'HW 1', points: 10, dueDate: '2024-01-15' },
      { id: assignmentIds[1], classId: classIds[0], categoryId: categoryIds[0], title: 'HW 2', points: 10, dueDate: '2024-01-22' },
      { id: assignmentIds[2], classId: classIds[0], categoryId: categoryIds[1], title: 'Test 1', points: 100, dueDate: '2024-01-25' },
      { id: assignmentIds[3], classId: classIds[1], categoryId: categoryIds[2], title: 'Lab 1', points: 50, dueDate: '2024-01-18' },
      { id: assignmentIds[4], classId: classIds[1], categoryId: categoryIds[2], title: 'Lab 2', points: 50, dueDate: '2024-01-25' },
      { id: assignmentIds[5], classId: classIds[1], categoryId: categoryIds[3], title: 'Midterm', points: 200, dueDate: '2024-02-01' },
    ],
    grades: [
      { id: 'grade1', assignmentId: assignmentIds[0], studentId: studentIds[0], score: 9 },
      { id: 'grade2', assignmentId: assignmentIds[0], studentId: studentIds[1], score: 8 },
      { id: 'grade3', assignmentId: assignmentIds[0], studentId: studentIds[2], score: 10 },
      { id: 'grade4', assignmentId: assignmentIds[1], studentId: studentIds[0], score: 10 },
      { id: 'grade5', assignmentId: assignmentIds[1], studentId: studentIds[1], score: 7 },
      { id: 'grade6', assignmentId: assignmentIds[2], studentId: studentIds[0], score: 85 },
      { id: 'grade7', assignmentId: assignmentIds[2], studentId: studentIds[1], score: 78 },
      { id: 'grade8', assignmentId: assignmentIds[2], studentId: studentIds[2], score: 92 },
      { id: 'grade9', assignmentId: assignmentIds[3], studentId: studentIds[0], score: 45 },
      { id: 'grade10', assignmentId: assignmentIds[3], studentId: studentIds[3], score: 48 },
      { id: 'grade11', assignmentId: assignmentIds[4], studentId: studentIds[0], score: 50 },
      { id: 'grade12', assignmentId: assignmentIds[5], studentId: studentIds[0], score: 180 },
    ],
    attendance: [],
    studyMaterials: [],
    session: { userId: null },
  };

  saveDB(db);
  return db;
}

export function byId<T extends { id: string }>(arr: T[], id: string): T | undefined {
  return arr.find(item => item.id === id);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
