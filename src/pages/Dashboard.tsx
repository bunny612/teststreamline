
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentExams, getTeacherExams } from "@/services/mockData";
import ExamCard from "@/components/ExamCard";
import { BarChart, LineChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const StudentDashboard = () => {
  const { user } = useAuth();
  const studentId = user?.id || '';
  const studentExams = getStudentExams(studentId);
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-exam-dark">Welcome, {user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming Exams</CardTitle>
            <CardDescription>Scheduled exams for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-exam-primary">
              {studentExams.upcoming.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Available Now</CardTitle>
            <CardDescription>Exams you can take right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-exam-secondary">
              {studentExams.available.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed</CardTitle>
            <CardDescription>Your finished exams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {studentExams.completed.length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Exams</CardTitle>
            <CardDescription>
              Exams you can take right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studentExams.available.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {studentExams.available.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} type="available" />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">
                No exams available at the moment
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
            <CardDescription>
              Exams scheduled for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studentExams.upcoming.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {studentExams.upcoming.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} type="upcoming" />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">
                No upcoming exams scheduled
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>
              Your recent exam results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studentExams.completed.length > 0 ? (
              <div className="space-y-6">
                {studentExams.completed.map((exam) => (
                  <div key={exam.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{exam.title}</h3>
                      <span className="text-sm font-medium">
                        {/* Assume 60% score for demo purposes */}
                        60%
                      </span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No performance data yet</h3>
                <p className="text-muted-foreground">
                  Complete some exams to see your performance metrics
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const TeacherDashboard = () => {
  const { user } = useAuth();
  const teacherId = user?.id || '';
  const teacherExams = getTeacherExams(teacherId);
  
  const totalExams = 
    teacherExams.draft.length + 
    teacherExams.scheduled.length + 
    teacherExams.completed.length;
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-exam-dark">Welcome, {user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Exams</CardTitle>
            <CardDescription>All your exams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-exam-primary">
              {totalExams}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Draft</CardTitle>
            <CardDescription>Unfinished exams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">
              {teacherExams.draft.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Scheduled</CardTitle>
            <CardDescription>Upcoming exams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-exam-secondary">
              {teacherExams.scheduled.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed</CardTitle>
            <CardDescription>Finished exams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {teacherExams.completed.length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Exams</CardTitle>
            <CardDescription>
              Your recently created or scheduled exams
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teacherExams.scheduled.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {teacherExams.scheduled.slice(0, 3).map((exam) => (
                  <ExamCard key={exam.id} exam={exam} type="scheduled" />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">
                No scheduled exams yet
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Student Performance</CardTitle>
            <CardDescription>
              Average scores by exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teacherExams.completed.length > 0 ? (
              <div className="space-y-4">
                {teacherExams.completed.map((exam) => (
                  <div key={exam.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{exam.title}</h3>
                      <span className="text-sm font-medium">
                        {/* Mock average score of 75% */}
                        75%
                      </span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No performance data yet</h3>
                <p className="text-muted-foreground">
                  Once students complete exams, you'll see their performance here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Draft Exams</CardTitle>
            <CardDescription>
              Exams you're still working on
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teacherExams.draft.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacherExams.draft.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} type="draft" />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">
                No draft exams
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  
  if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  }
  
  return <StudentDashboard />;
};

export default Dashboard;
