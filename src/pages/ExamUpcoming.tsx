
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
import { Calendar, Clock } from "lucide-react";
import ExamCard from "@/components/ExamCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

// Mock data for student's exams
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
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    status: "completed",
    totalPoints: 50,
    questions: []
  },
  {
    id: "4",
    title: "Pop Quiz",
    description: "Quick assessment of today's lecture material",
    teacherId: "1",
    duration: 15,
    startDate: new Date().toISOString(), // Today
    endDate: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
    status: "active", // Available now
    totalPoints: 20,
    questions: []
  }
];

const ExamUpcoming = () => {
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
  
  const now = new Date();
  
  // Exams that are currently available to take
  const availableExams = exams.filter(exam => {
    const startDate = new Date(exam.startDate);
    const endDate = new Date(exam.endDate);
    return startDate <= now && endDate >= now;
  });
  
  // Exams coming up in the future
  const upcomingExams = exams.filter(exam => {
    const startDate = new Date(exam.startDate);
    return startDate > now;
  });
  
  // Past exams
  const pastExams = exams.filter(exam => {
    const endDate = new Date(exam.endDate);
    return endDate < now;
  });
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-exam-primary">My Exams</h1>
        <p className="text-muted-foreground">View your upcoming and past exams</p>
      </div>
      
      {availableExams.length > 0 && (
        <div className="mb-8">
          <div className="bg-exam-light border border-exam-primary p-4 rounded-md mb-4">
            <h2 className="text-lg font-semibold text-exam-primary mb-2">
              Available Now
            </h2>
            <p className="text-sm text-exam-primary mb-4">
              These exams are currently available for you to take.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableExams.map(exam => (
                <ExamCard key={exam.id} exam={exam} type="available" />
              ))}
            </div>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Exams</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingExams.map(exam => (
                <ExamCard key={exam.id} exam={exam} type="upcoming" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You don't have any upcoming exams.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastExams.map(exam => (
                <ExamCard key={exam.id} exam={exam} type="completed" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You haven't taken any exams yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamUpcoming;
