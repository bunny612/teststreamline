
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ExamResult, Exam } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart2, ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// Mock data for a student's exam results
const mockExamResults: ExamResult[] = [
  {
    examId: "1",
    studentId: "2",
    score: 85,
    totalPoints: 100,
    completedAt: "2023-10-15T11:30:00.000Z",
    feedback: "Good understanding of core concepts. Work on definitions."
  },
  {
    examId: "2",
    studentId: "2",
    score: 42,
    totalPoints: 50,
    completedAt: "2023-11-05T10:25:00.000Z",
    feedback: "Excellent work on the short answers!"
  }
];

// Mock exams for reference
const mockExams: Exam[] = [
  {
    id: "1",
    title: "Midterm Examination",
    description: "Comprehensive assessment of first semester material",
    teacherId: "1",
    duration: 120,
    startDate: "2023-10-15T09:00:00.000Z",
    endDate: "2023-10-15T11:00:00.000Z",
    status: "completed",
    totalPoints: 100,
    questions: []
  },
  {
    id: "2",
    title: "Quiz on Chapter 3",
    description: "Brief assessment on recent material",
    teacherId: "1",
    duration: 30,
    startDate: "2023-11-05T10:00:00.000Z",
    endDate: "2023-11-05T10:30:00.000Z",
    status: "completed",
    totalPoints: 50,
    questions: []
  }
];

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setResults(mockExamResults);
      setExams(mockExams);
      setLoading(false);
      
      // If an exam ID is provided, select that result
      if (id) {
        const result = mockExamResults.find(r => r.examId === id);
        if (result) {
          setSelectedResult(result);
          const exam = mockExams.find(e => e.id === id);
          if (exam) {
            setSelectedExam(exam);
          }
        }
      }
    }, 1000);
  }, [id]);
  
  const handleSelectResult = (examId: string) => {
    const result = results.find(r => r.examId === examId);
    if (result) {
      setSelectedResult(result);
      const exam = exams.find(e => e.id === examId);
      if (exam) {
        setSelectedExam(exam);
      }
    }
    
    // Update URL without navigating away
    navigate(`/results/${examId}`, { replace: true });
  };
  
  const handleDownloadResult = () => {
    // In a real app, this would generate and download a PDF
    alert("In a real app, this would download a PDF of your results.");
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const getPercentageScore = (score: number, total: number) => {
    return Math.round((score / total) * 100);
  };
  
  const getGradeFromPercentage = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };
  
  // Prepare chart data
  const chartData = results.map(result => {
    const exam = exams.find(e => e.id === result.examId);
    return {
      name: exam?.title || 'Unknown Exam',
      score: getPercentageScore(result.score, result.totalPoints),
    };
  });
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      {!selectedResult ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-exam-primary">My Results</h1>
            <p className="text-muted-foreground">View your exam results and performance</p>
          </div>
          
          {results.length > 0 ? (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                        <Bar dataKey="score" fill="#4A90E2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <h2 className="text-xl font-semibold mb-4">Exam Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(result => {
                  const exam = exams.find(e => e.id === result.examId);
                  const percentage = getPercentageScore(result.score, result.totalPoints);
                  const grade = getGradeFromPercentage(percentage);
                  
                  return (
                    <Card key={result.examId} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{exam?.title || 'Unknown Exam'}</CardTitle>
                          <span 
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              percentage >= 70 
                                ? 'bg-green-100 text-green-700' 
                                : percentage >= 60 
                                  ? 'bg-yellow-100 text-yellow-700' 
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            Grade: {grade}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Score:</span>
                            <span className="font-medium">{result.score} / {result.totalPoints} ({percentage}%)</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Completed:</span>
                            <span>{formatDate(result.completedAt)}</span>
                          </div>
                          {result.feedback && (
                            <div className="text-sm">
                              <p className="text-muted-foreground mb-1">Feedback:</p>
                              <p className="italic">{result.feedback}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full bg-exam-primary"
                          onClick={() => handleSelectResult(result.examId)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Results Yet</h2>
              <p className="text-muted-foreground mb-6">You haven't completed any exams yet.</p>
              <Button 
                onClick={() => navigate("/exams/upcoming")}
                className="bg-exam-primary"
              >
                View Available Exams
              </Button>
            </div>
          )}
        </>
      ) : selectedExam ? (
        <div>
          <Button 
            variant="outline" 
            className="mb-6" 
            onClick={() => {
              setSelectedResult(null);
              setSelectedExam(null);
              navigate("/results", { replace: true });
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Results
          </Button>
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-exam-primary">{selectedExam.title}</h1>
            <p className="text-muted-foreground">{selectedExam.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-exam-primary">
                  {selectedResult.score} 
                  <span className="text-base text-muted-foreground font-normal ml-1">
                    / {selectedResult.totalPoints}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {getPercentageScore(selectedResult.score, selectedResult.totalPoints)}% 
                  (Grade {getGradeFromPercentage(getPercentageScore(selectedResult.score, selectedResult.totalPoints))})
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">
                  {formatDate(selectedResult.completedAt)}
                </div>
                <p className="text-muted-foreground">
                  {new Date(selectedResult.completedAt).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Exam Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{selectedExam.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{formatDate(selectedExam.startDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {selectedResult.feedback && (
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Teacher Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="italic">{selectedResult.feedback}</p>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-center">
            <Button 
              className="bg-exam-primary" 
              onClick={handleDownloadResult}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Result as PDF
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Result not found.</p>
          <Button 
            onClick={() => navigate("/results")} 
            className="mt-4"
          >
            Back to Results
          </Button>
        </div>
      )}
    </div>
  );
};

export default Results;
