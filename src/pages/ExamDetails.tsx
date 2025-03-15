
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Exam } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, AlertCircle, ArrowLeft, FileText, CheckCircle } from "lucide-react";
import { format, isAfter, isBefore, parseISO } from "date-fns";

// Mock exam for demonstration
const mockExam: Exam = {
  id: "exam1",
  title: "Introduction to Computer Science",
  description: "Basic concepts and fundamentals of CS",
  teacherId: "teacher1",
  duration: 60, // 60 minutes
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  status: "active",
  totalPoints: 100,
  questions: [
    {
      id: "q1",
      examId: "exam1",
      type: "multiple-choice",
      content: "What does CPU stand for?",
      options: [
        "Central Processing Unit",
        "Computer Personal Unit",
        "Central Process Utility",
        "Central Processor Underwriter"
      ],
      correctAnswer: 0,
      points: 10
    },
    {
      id: "q2",
      examId: "exam1",
      type: "multiple-choice",
      content: "Which of the following is not a programming language?",
      options: [
        "Java",
        "Python",
        "HTML",
        "Microsoft Word"
      ],
      correctAnswer: 3,
      points: 10
    },
    // Additional questions would be here
  ]
};

const ExamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  
  useEffect(() => {
    // In a real app, fetch the exam by ID from the API
    setTimeout(() => {
      setExam(mockExam);
      setLoading(false);
    }, 1000);
  }, [id]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Exam Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The exam you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button 
          onClick={() => navigate("/exams/upcoming")}
          className="bg-exam-primary"
        >
          Back to Exams
        </Button>
      </div>
    );
  }
  
  const now = new Date();
  const startDate = parseISO(exam.startDate);
  const endDate = parseISO(exam.endDate);
  
  const isExamAvailable = isAfter(now, startDate) && isBefore(now, endDate);
  const isExamUpcoming = isAfter(startDate, now);
  const isExamExpired = isAfter(now, endDate);
  
  const formatDate = (date: Date) => {
    return format(date, "MMMM d, yyyy 'at' h:mm a");
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={() => navigate("/exams/upcoming")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Exams
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="shadow-md">
            <CardHeader className="border-b bg-exam-light">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-exam-primary">{exam.title}</CardTitle>
                  <CardDescription>{exam.description}</CardDescription>
                </div>
                {isExamAvailable && (
                  <span className="px-2 py-1 bg-exam-accent text-exam-primary text-xs rounded-full font-medium">
                    Available Now
                  </span>
                )}
                {isExamUpcoming && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                    Upcoming
                  </span>
                )}
                {isExamExpired && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    Expired
                  </span>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Exam Schedule</p>
                      <p className="text-sm text-muted-foreground">
                        Available from {formatDate(startDate)} to {formatDate(endDate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">
                        {exam.duration} minutes ({Math.floor(exam.duration/60) > 0 ? `${Math.floor(exam.duration/60)} hours ` : ''}
                        {exam.duration % 60 > 0 ? `${exam.duration % 60} minutes` : ''})
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Exam Information</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Questions:</span>
                      <span className="font-medium">{exam.questions.length}</span>
                    </li>
                    <li className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Points:</span>
                      <span className="font-medium">{exam.totalPoints}</span>
                    </li>
                    <li className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Question Types:</span>
                      <span className="font-medium">
                        {Array.from(new Set(exam.questions.map(q => q.type))).join(', ')}
                      </span>
                    </li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Exam Instructions</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    <li>This exam must be completed in a single session. Once started, the timer cannot be paused.</li>
                    <li>You have {exam.duration} minutes to complete all questions.</li>
                    <li>You can mark questions for review and come back to them before submitting.</li>
                    <li>For multiple choice questions, select the best answer from the options provided.</li>
                    <li>For short and long answer questions, type your responses in the provided text boxes.</li>
                    <li>Your answers are automatically saved as you progress through the exam.</li>
                    <li>If time expires before you submit, your answers will be automatically submitted.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-muted/50 border-t justify-end py-3">
              {isExamAvailable && (
                <Button 
                  onClick={() => setShowStartConfirm(true)}
                  className="bg-exam-primary"
                >
                  Start Exam
                </Button>
              )}
              
              {isExamUpcoming && (
                <div className="text-sm text-muted-foreground">
                  This exam will be available on {formatDate(startDate)}
                </div>
              )}
              
              {isExamExpired && (
                <div className="text-sm text-red-600">
                  This exam is no longer available
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Ready to Begin?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-exam-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Time Management</h4>
                    <p className="text-sm text-muted-foreground">
                      You'll have {exam.duration} minutes. Budget your time wisely for all {exam.questions.length} questions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-exam-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Read Carefully</h4>
                    <p className="text-sm text-muted-foreground">
                      Take time to fully understand each question before answering.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-exam-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Answer All Questions</h4>
                    <p className="text-sm text-muted-foreground">
                      Try to answer every question, even if you're unsure. There's no penalty for wrong answers.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            {isExamAvailable && (
              <CardFooter className="bg-muted/50 border-t">
                <Button 
                  onClick={() => setShowStartConfirm(true)}
                  className="w-full bg-exam-primary"
                >
                  Start Exam Now
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
      
      {/* Confirm Start Modal */}
      <AlertDialog open={showStartConfirm} onOpenChange={setShowStartConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you ready to begin the exam? Once started, the timer will begin and cannot be paused.
              
              <div className="mt-3 bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
                <p className="font-medium">Important:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Ensure you have a stable internet connection</li>
                  <li>Find a quiet place with no distractions</li>
                  <li>You have {exam.duration} minutes to complete this exam</li>
                  <li>Your answers will be auto-saved as you progress</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => navigate(`/exams/take/${exam.id}`)}
              className="bg-exam-primary"
            >
              Begin Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamDetails;
