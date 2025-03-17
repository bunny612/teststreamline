
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
import { Calendar, Clock, RefreshCcw } from "lucide-react";
import ExamCard from "@/components/ExamCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentExams } from "@/services/mockData";
import { useToast } from "@/hooks/use-toast";

const ExamUpcoming = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchExams = () => {
    setRefreshing(true);
    // In a real app, this would be an API call with the latest data
    setTimeout(() => {
      const studentId = user?.id || '';
      const studentExamsData = getStudentExams(studentId);
      // Combine all exam types into one array
      const allExams = [
        ...studentExamsData.upcoming,
        ...studentExamsData.available,
        ...studentExamsData.completed
      ];
      
      setExams(allExams);
      setLoading(false);
      setRefreshing(false);
    }, 600); // Short timeout to simulate network request
  };
  
  useEffect(() => {
    fetchExams();
    
    // Set up poll interval for real-time updates (every 60 seconds)
    const pollInterval = setInterval(fetchExams, 60000);
    
    return () => clearInterval(pollInterval);
  }, [user?.id]);
  
  const handleRefresh = () => {
    fetchExams();
    toast({
      title: "Refreshing exam list",
      description: "Getting the latest available exams"
    });
  };
  
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-exam-primary">My Exams</h1>
          <p className="text-muted-foreground">View your upcoming and past exams</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
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
