
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Exam, ExamAttempt, StudentAnswer, ExamResult } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check, ArrowLeft, Download, FileText, User, FileCheck, FilePenLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const mockExam: Exam = {
  id: "exam1",
  title: "Introduction to Computer Science",
  description: "Basic concepts and fundamentals of CS",
  teacherId: "teacher1",
  duration: 60,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
    {
      id: "q3",
      examId: "exam1",
      type: "short-answer",
      content: "What is an algorithm?",
      correctAnswer: "A step-by-step procedure to solve a problem",
      points: 15
    },
    {
      id: "q4",
      examId: "exam1",
      type: "long-answer",
      content: "Explain the difference between compiler and interpreter.",
      points: 25
    }
  ]
};

const mockAttempts: ExamAttempt[] = [
  {
    id: "attempt1",
    examId: "exam1",
    studentId: "student1",
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() - 1800000).toISOString(),
    status: "completed",
    answers: [
      {
        questionId: "q1",
        answer: 0,
        score: 10,
        feedback: "Correct answer!"
      },
      {
        questionId: "q2",
        answer: 3,
        score: 10,
        feedback: "Correct answer!"
      },
      {
        questionId: "q3",
        answer: "A step-by-step process to solve a problem or task",
        score: 12,
        feedback: "Good explanation, but missing precision"
      },
      {
        questionId: "q4",
        answer: "A compiler translates the entire program at once while an interpreter executes the program line-by-line.",
        score: 20,
        feedback: "Good but could be more detailed"
      }
    ]
  },
  {
    id: "attempt2",
    examId: "exam1",
    studentId: "student2",
    startTime: new Date(Date.now() - 7200000).toISOString(),
    endTime: new Date(Date.now() - 5400000).toISOString(),
    status: "completed",
    answers: [
      {
        questionId: "q1",
        answer: 1,
        score: 0,
        feedback: "Incorrect answer. CPU stands for Central Processing Unit."
      },
      {
        questionId: "q2",
        answer: 2,
        score: 0,
        feedback: "Incorrect. HTML is a markup language, but Microsoft Word is not a programming language."
      },
      {
        questionId: "q3",
        answer: "A set of instructions to complete a task",
        score: 10,
        feedback: "Basic definition but lacks specificity"
      },
      {
        questionId: "q4",
        answer: "Compiler converts code to machine code all at once. Interpreter goes through the code line by line.",
        score: 18,
        feedback: "Good explanation, but missing details on efficiency and usage"
      }
    ]
  }
];

// Mock student data
const mockStudents = {
  "student1": { name: "Alex Johnson", email: "alex@example.com" },
  "student2": { name: "Jamie Smith", email: "jamie@example.com" }
};

const ExamEvaluate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [currentAttemptIndex, setCurrentAttemptIndex] = useState<number | null>(null);
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState<number>(0);
  const [showConfirmGrading, setShowConfirmGrading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [savingGrades, setSavingGrades] = useState(false);
  
  // Fetch exam and attempts data
  useEffect(() => {
    // In a real app, fetch from API
    setTimeout(() => {
      setExam(mockExam);
      setAttempts(mockAttempts);
      setLoading(false);
    }, 1000);
  }, [id]);
  
  const handleScoreChange = (questionId: string, value: number) => {
    if (currentAttemptIndex === null) return;
    
    setAttempts(prev => {
      const newAttempts = [...prev];
      const attempt = newAttempts[currentAttemptIndex];
      const answerIndex = attempt.answers.findIndex(a => a.questionId === questionId);
      
      if (answerIndex !== -1) {
        attempt.answers[answerIndex].score = value;
      }
      
      return newAttempts;
    });
    
    setIsDirty(true);
  };
  
  const handleFeedbackChange = (questionId: string, value: string) => {
    if (currentAttemptIndex === null) return;
    
    setAttempts(prev => {
      const newAttempts = [...prev];
      const attempt = newAttempts[currentAttemptIndex];
      const answerIndex = attempt.answers.findIndex(a => a.questionId === questionId);
      
      if (answerIndex !== -1) {
        attempt.answers[answerIndex].feedback = value;
      }
      
      return newAttempts;
    });
    
    setIsDirty(true);
  };
  
  const calculateTotalScore = (attemptIndex: number) => {
    if (!attempts[attemptIndex]) return 0;
    
    return attempts[attemptIndex].answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
  };
  
  const calculateMaxScore = () => {
    if (!exam) return 0;
    return exam.totalPoints;
  };
  
  const handleSubmitGrading = () => {
    if (currentAttemptIndex === null) return;
    
    setSavingGrades(true);
    
    // In a real app, send to API
    setTimeout(() => {
      // Update the attempt status
      setAttempts(prev => {
        const newAttempts = [...prev];
        const attempt = newAttempts[currentAttemptIndex];
        attempt.status = "graded";
        attempt.totalScore = calculateTotalScore(currentAttemptIndex);
        return newAttempts;
      });
      
      setSavingGrades(false);
      setIsDirty(false);
      
      toast({
        title: "Grading Submitted",
        description: "The student's exam has been successfully graded",
      });
      
      setCurrentAttemptIndex(null);
    }, 1500);
  };
  
  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    toast({
      title: "PDF Generated",
      description: "The exam results have been downloaded as a PDF",
    });
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Exam Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The exam you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button 
          onClick={() => navigate("/exams/manage")}
          className="bg-exam-primary"
        >
          Back to Exams
        </Button>
      </div>
    );
  }
  
  // Show list of attempts if no attempt is selected
  if (currentAttemptIndex === null) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="outline" 
          className="mb-6" 
          onClick={() => navigate("/exams/manage")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Exams
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-exam-primary mb-2">{exam.title}</h1>
          <p className="text-muted-foreground">{exam.description}</p>
        </div>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
            <CardDescription>
              {attempts.length} students have submitted this exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attempts.length > 0 ? (
              <div className="space-y-4">
                {attempts.map((attempt, index) => {
                  const student = mockStudents[attempt.studentId as keyof typeof mockStudents];
                  const totalScore = attempt.totalScore || calculateTotalScore(index);
                  const maxScore = calculateMaxScore();
                  const percentage = Math.round((totalScore / maxScore) * 100);
                  
                  return (
                    <div 
                      key={attempt.id} 
                      className="border p-4 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setCurrentAttemptIndex(index)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-exam-light text-exam-primary flex items-center justify-center mr-3">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{student.name}</h3>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center">
                              <span className="font-medium">{totalScore} / {maxScore}</span>
                              <span className={cn(
                                "ml-2 text-xs px-2 py-1 rounded-full",
                                percentage >= 70 ? "bg-green-100 text-green-800" :
                                percentage >= 40 ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              )}>
                                {percentage}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Submitted {format(new Date(attempt.endTime), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          
                          <Badge 
                            variant={attempt.status === "graded" ? "default" : "outline"}
                            className={attempt.status === "graded" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                          >
                            {attempt.status === "graded" ? (
                              <span className="flex items-center">
                                <FileCheck className="h-3 w-3 mr-1" />
                                Graded
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <FilePenLine className="h-3 w-3 mr-1" />
                                Needs Grading
                              </span>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No submissions yet.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/50 justify-end">
            <Button 
              variant="outline"
              className="flex items-center"
              onClick={handleDownloadPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Download All Results
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Show grading interface for the selected attempt
  const currentAttempt = attempts[currentAttemptIndex];
  const student = mockStudents[currentAttempt.studentId as keyof typeof mockStudents];
  
  // Get the current question and answer
  const currentAnswer = currentAttempt.answers[currentAnswerIndex];
  const currentQuestion = exam.questions.find(q => q.id === currentAnswer.questionId);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={() => {
          if (isDirty) {
            setShowConfirmGrading(true);
          } else {
            setCurrentAttemptIndex(null);
          }
        }}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Submissions
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="shadow-md mb-6">
            <CardHeader className="border-b bg-exam-light">
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-exam-primary">Grading: {student.name}</CardTitle>
                  <CardDescription>
                    {format(new Date(currentAttempt.endTime), "MMMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </div>
                <Badge 
                  variant={currentAttempt.status === "graded" ? "default" : "outline"}
                  className={currentAttempt.status === "graded" ? "bg-green-100 text-green-800" : ""}
                >
                  {currentAttempt.status === "graded" ? "Graded" : "Needs Grading"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Question {currentAnswerIndex + 1} of {currentAttempt.answers.length}</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentAnswerIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentAnswerIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentAnswerIndex(prev => Math.min(currentAttempt.answers.length - 1, prev + 1))}
                      disabled={currentAnswerIndex === currentAttempt.answers.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
                
                <Progress
                  value={((currentAnswerIndex + 1) / currentAttempt.answers.length) * 100}
                  className="h-1 mb-4"
                />
                
                {currentQuestion && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium uppercase text-muted-foreground">Question</span>
                        <span className="text-xs font-medium bg-exam-light text-exam-primary px-2 py-0.5 rounded">
                          {currentQuestion.points} points
                        </span>
                      </div>
                      <div className="mt-1 p-3 bg-slate-50 rounded-md">
                        <p className="font-medium">{currentQuestion.content}</p>
                        
                        {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                          <div className="mt-2 space-y-1">
                            {currentQuestion.options.map((option, index) => (
                              <div 
                                key={index} 
                                className={cn(
                                  "flex items-center p-2 rounded-md",
                                  currentQuestion.correctAnswer === index ? "bg-green-50 border border-green-200" : "",
                                  currentAnswer.answer === index && currentQuestion.correctAnswer !== index ? "bg-red-50 border border-red-200" : ""
                                )}
                              >
                                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm mr-2">
                                  {String.fromCharCode(65 + index)}
                                </span>
                                {option}
                                {currentQuestion.correctAnswer === index && (
                                  <span className="ml-auto text-green-600 text-sm font-medium">
                                    Correct
                                  </span>
                                )}
                                {currentAnswer.answer === index && currentQuestion.correctAnswer !== index && (
                                  <span className="ml-auto text-red-600 text-sm font-medium">
                                    Student Selected
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium uppercase text-muted-foreground">Student's Answer</span>
                      <div className="mt-1 p-3 bg-white border rounded-md">
                        {currentQuestion.type === "multiple-choice" ? (
                          <p>{currentQuestion.options?.[currentAnswer.answer as number] || "No answer provided"}</p>
                        ) : (
                          <p>{currentAnswer.answer || "No answer provided"}</p>
                        )}
                      </div>
                    </div>
                    
                    {currentQuestion.type !== "multiple-choice" && currentQuestion.type === "short-answer" && (
                      <div>
                        <span className="text-xs font-medium uppercase text-muted-foreground">Expected Answer</span>
                        <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md">
                          <p>{currentQuestion.correctAnswer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-1">Score</label>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        min="0"
                        max={currentQuestion?.points}
                        value={currentAnswer.score?.toString() || "0"}
                        onChange={(e) => handleScoreChange(currentAnswer.questionId, Number(e.target.value))}
                        className="w-20"
                      />
                      <span className="mx-2">/</span>
                      <span>{currentQuestion?.points || 0}</span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Feedback</label>
                    <Textarea
                      value={currentAnswer.feedback || ""}
                      onChange={(e) => handleFeedbackChange(currentAnswer.questionId, e.target.value)}
                      placeholder="Provide feedback to the student..."
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 border-t justify-between">
              <div className="text-sm">
                <span className="font-medium">Total Score: </span>
                <span>{calculateTotalScore(currentAttemptIndex)} / {calculateMaxScore()}</span>
              </div>
              
              <Button 
                onClick={() => setShowConfirmGrading(true)}
                className="bg-exam-primary"
                disabled={savingGrades}
              >
                {savingGrades ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Saving...</span>
                  </span>
                ) : (
                  "Submit Grades"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-md sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">All Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentAttempt.answers.map((answer, index) => {
                  const question = exam.questions.find(q => q.id === answer.questionId);
                  return (
                    <div 
                      key={answer.questionId}
                      className={cn(
                        "p-3 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors",
                        currentAnswerIndex === index && "bg-exam-light border-exam-primary"
                      )}
                      onClick={() => setCurrentAnswerIndex(index)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Question {index + 1}</span>
                        <div className="flex items-center">
                          <span className="text-sm">{answer.score || 0}/{question?.points || 0}</span>
                        </div>
                      </div>
                      <p className="text-sm truncate text-muted-foreground">
                        {question?.content || ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 border-t">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleDownloadPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Evaluation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Confirm Grading Dialog */}
      <AlertDialog open={showConfirmGrading} onOpenChange={setShowConfirmGrading}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Grades</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit these grades? The student will be able to see your evaluation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmGrading(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowConfirmGrading(false);
                handleSubmitGrading();
              }}
              className="bg-exam-primary"
            >
              Submit Grades
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamEvaluate;
