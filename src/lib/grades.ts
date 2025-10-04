import { Database, Assignment, Grade, Category } from './db';

export function getStudentsInClass(db: Database, classId: string) {
  const enrollments = db.enrollments.filter(e => e.classId === classId);
  return enrollments.map(e => db.profiles.find(p => p.id === e.studentId)).filter(Boolean);
}

export function getAssignmentsForClass(db: Database, classId: string) {
  return db.assignments.filter(a => a.classId === classId);
}

export function getCategoriesForClass(db: Database, classId: string) {
  return db.categories.filter(c => c.classId === classId);
}

export function calculateWeightedAverage(db: Database, studentId: string, classId: string): number | null {
  const categories = getCategoriesForClass(db, classId);
  const assignments = getAssignmentsForClass(db, classId);
  
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const category of categories) {
    const categoryAssignments = assignments.filter(a => a.categoryId === category.id);
    if (categoryAssignments.length === 0) continue;

    let earnedPoints = 0;
    let possiblePoints = 0;
    let hasGrades = false;

    for (const assignment of categoryAssignments) {
      const grade = db.grades.find(g => g.assignmentId === assignment.id && g.studentId === studentId);
      if (grade && grade.score !== null) {
        earnedPoints += grade.score;
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
}

export function getLetterGrade(percent: number | null): string {
  if (percent === null) return '-';
  if (percent >= 90) return 'A';
  if (percent >= 80) return 'B';
  if (percent >= 70) return 'C';
  if (percent >= 60) return 'D';
  return 'F';
}

export function calculateClassAverage(db: Database, classId: string): number | null {
  const students = getStudentsInClass(db, classId);
  if (students.length === 0) return null;

  const averages = students
    .map(s => calculateWeightedAverage(db, s!.id, classId))
    .filter(avg => avg !== null) as number[];

  if (averages.length === 0) return null;
  return averages.reduce((sum, avg) => sum + avg, 0) / averages.length;
}
