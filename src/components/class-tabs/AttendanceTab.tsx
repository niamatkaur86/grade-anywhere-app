import { useState } from 'react';
import { Database, generateId, byId, Attendance } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus } from 'lucide-react';
import { getStudentsInClass } from '@/lib/grades';
import { toast } from 'sonner';
import { saveDB } from '@/lib/db';

interface AttendanceTabProps {
  db: Database;
  classId: string;
  onUpdate: (db: Database) => void;
}

export function AttendanceTab({ db, classId, onUpdate }: AttendanceTabProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const students = getStudentsInClass(db, classId);

  const getAttendance = (studentId: string, date: string): Attendance | undefined => {
    return db.attendance.find(a => 
      a.studentId === studentId && 
      a.classId === classId && 
      a.date === date
    );
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    let attendance = getAttendance(studentId, selectedDate);

    if (attendance) {
      attendance.status = status;
    } else {
      db.attendance.push({
        id: generateId(),
        classId,
        studentId,
        date: selectedDate,
        status,
      });
    }

    saveDB(db);
    onUpdate({ ...db });
    toast.success('Attendance recorded');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'present': return 'text-accent';
      case 'absent': return 'text-destructive';
      case 'late': return 'text-warning';
      case 'excused': return 'text-info';
      default: return 'text-muted-foreground';
    }
  };

  const getAttendanceStats = (studentId: string) => {
    const records = db.attendance.filter(a => a.studentId === studentId && a.classId === classId);
    const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const total = records.length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(0) : '-';
    return { present, total, rate };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attendance Tracking</CardTitle>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attendance Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                if (!student) return null;
                const attendance = getAttendance(student.id, selectedDate);
                const stats = getAttendanceStats(student.id);

                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Select
                        value={attendance?.status || ''}
                        onValueChange={(value) => handleAttendanceChange(student.id, value as any)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Mark..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="excused">Excused</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className={getStatusColor(attendance?.status)}>
                        {stats.rate !== '-' ? `${stats.rate}%` : '-'} ({stats.present}/{stats.total})
                      </span>
                    </TableCell>
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
