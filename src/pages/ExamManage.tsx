
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Exam } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Plus, FileText, Clock } from "lucide-react";
import ExamCard from "@/components/ExamCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

// Mock data for teacher's exams
const mockExams: Exam[] = [
  {
    id: "1",
    title: "Midterm Examination",
    description: "Comprehensive assessment of first semester material",
    teacherId: "1",
    duration: 120,
    startDate: "2023-11-15T09:00:00.000Z",
    endDate: "2023-11-15T11:00:00.000Z",
    status: "scheduled",
    totalPoints: 100,
    questions: []
  },
  {
    id: "2",
    title: "Quiz on Chapter 3",
    description: "Brief assessment on recent material",
    teacherId: "1",
    duration: 30,
    startDate: "2023-11-08T10:00:00.000Z",
    endDate: "2023-11-08T10:30:00.000Z",
    status: "completed",
    totalPoints: 50,
    questions: []
  },
  {
    id: "3",
    title: "Final Exam (Draft)",
    description: "End of year comprehensive assessment",
    teacherId: "1",
    duration: 180,
    startDate: "2023-12-10T09:00:00.000Z",
    endDate: "2023-12-10T12:00:00.000Z",
    status: "draft",
    totalPoints: 150,
    questions: []
  }
];

const ExamManage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setExams(mockExams);
      setLoading(false);
    }, 1000);
  }, []);
  
  const draftExams = exams.filter(exam => exam.status === "draft");
  const scheduledExams = exams.filter(exam => exam.status === "scheduled");
  const completedExams = exams.filter(exam => exam.status === "completed");
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-exam-primary">Manage Exams</h1>
          <p className="text-muted-foreground">Create, edit, and manage your exams</p>
        </div>
        <Button 
          className="bg-exam-primary" 
          onClick={() => navigate("/exams/create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Exam
        </Button>
      </div>
      
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Exam Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-exam-light p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-exam-primary mr-2" />
                  <h3 className="font-medium">Draft Exams</h3>
                </div>
                <p className="text-2xl font-bold">{draftExams.length}</p>
                <p className="text-sm text-muted-foreground">Exams in preparation</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="font-medium">Scheduled Exams</h3>
                </div>
                <p className="text-2xl font-bold">{scheduledExams.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming exams</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="font-medium">Completed Exams</h3>
                </div>
                <p className="text-2xl font-bold">{completedExams.length}</p>
                <p className="text-sm text-muted-foreground">Past exams</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Exams</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map(exam => (
                <ExamCard 
                  key={exam.id} 
                  exam={exam} 
                  type={
                    exam.status === "draft" 
                      ? "draft" 
                      : exam.status === "scheduled" 
                        ? "scheduled" 
                        : "completed"
                  } 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't created any exams yet.</p>
              <Button 
                className="bg-exam-primary" 
                onClick={() => navigate("/exams/create")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Exam
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="draft">
          {draftExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftExams.map(exam => (
                <ExamCard key={exam.id} exam={exam} type="draft" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You don't have any draft exams.</p>
              <Button 
                className="bg-exam-primary" 
                onClick={() => navigate("/exams/create")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Exam
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="scheduled">
          {scheduledExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduledExams.map(exam => (
                <ExamCard key={exam.id} exam={exam} type="scheduled" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You don't have any scheduled exams.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedExams.map(exam => (
                <ExamCard key={exam.id} exam={exam} type="completed" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You don't have any completed exams yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamManage;
