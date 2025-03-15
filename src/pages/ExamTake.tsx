
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Exam, Question, StudentAnswer, ExamAttempt } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check, Clock, FileText, Flag, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Mock exam data
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
    },
    {
      id: "q5",
      examId: "exam1",
      type: "multiple-choice",
      content: "Which data structure uses LIFO principle?",
      options: [
        "Queue",
        "Stack",
        "LinkedList",
        "Tree"
      ],
      correctAnswer: 1,
      points: 10
    },
    {
      id: "q6",
      examId: "exam1",
      type: "short-answer",
      content: "What is the time complexity of binary search?",
      correctAnswer: "O(log n)",
      points: 15
    },
    {
      id: "q7",
      examId: "exam1",
      type: "long-answer",
      content: "Explain the concept of object-oriented programming and its key principles.",
      points: 25
    }
  ]
};

const ExamTake = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [attemptStarted, setAttemptStarted] = useState<boolean>(false);
  const [examCompleted, setExamCompleted] = useState<boolean>(false);
  const [showTimeWarning, setShowTimeWarning] = useState<boolean>(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);
  const [autoSaving, setAutoSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize exam data
  useEffect(() => {
    // Fetch exam by ID from API (using mock data for now)
    setTimeout(() => {
      setExam(mockExam);
      setLoading(false);
    }, 1000);
  }, [id]);

  // Initialize answers when exam is loaded
  useEffect(() => {
    if (exam) {
      const initialAnswers = exam.questions.map(question => ({
        questionId: question.id,
        answer: "",
        markedForReview: false
      }));
      setAnswers(initialAnswers);
    }
  }, [exam]);

  // Start exam timer
  useEffect(() => {
    if (exam && attemptStarted && !examCompleted) {
      const durationInSeconds = exam.duration * 60;
      setTimeRemaining(durationInSeconds);
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up, force submission
            handleSubmitExam();
            return 0;
          }
          
          // Show warning when 5 minutes remaining
          if (prev === 300) {
            setShowTimeWarning(true);
          }
          
          return prev - 1;
        });
      }, 1000);
      
      // Setup auto-save (every 30 seconds)
      autoSaveRef.current = setInterval(() => {
        handleAutoSave();
      }, 30000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [exam, attemptStarted, examCompleted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startExam = () => {
    setAttemptStarted(true);
    toast({
      title: "Exam Started",
      description: `You have ${exam?.duration} minutes to complete this exam.`,
    });
  };

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers(prev => 
      prev.map(a => 
        a.questionId === questionId 
          ? { ...a, answer: value } 
          : a
      )
    );
  };

  const toggleMarkForReview = (questionId: string) => {
    setAnswers(prev => 
      prev.map(a => 
        a.questionId === questionId 
          ? { ...a, markedForReview: !a.markedForReview } 
          : a
      )
    );
  };

  const handleAutoSave = () => {
    // In a real app, this would save to the server
    setAutoSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setAutoSaving(false);
      setLastSaved(new Date());
    }, 1000);
  };

  const handleSubmitExam = () => {
    // Stop timer
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    
    // Create attempt object
    const attempt: ExamAttempt = {
      id: crypto.randomUUID(),
      examId: exam?.id || "",
      studentId: user?.id || "",
      startTime: new Date(Date.now() - (exam?.duration || 0) * 60 * 1000).toISOString(),
      endTime: new Date().toISOString(),
      status: "completed",
      answers: answers
    };
    
    // In a real app, this would submit to the server
    console.log("Submitted attempt:", attempt);
    
    setExamCompleted(true);
    toast({
      title: "Exam Submitted",
      description: "Your answers have been submitted successfully.",
    });
    
    // Redirect to results page after 3 seconds
    setTimeout(() => {
      navigate("/results");
    }, 3000);
  };

  const getQuestionStatus = (index: number) => {
    const question = exam?.questions[index];
    const answer = answers.find(a => a.questionId === question?.id);
    
    if (answer?.markedForReview) return "review";
    if (answer?.answer) return "answered";
    return "unanswered";
  };

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < (exam?.questions.length || 0)) {
      setCurrentQuestionIndex(index);
    }
  };

  const getProgressPercentage = () => {
    if (!exam) return 0;
    const answeredCount = answers.filter(a => a.answer).length;
    return (answeredCount / exam.questions.length) * 100;
  };

  // Render loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Render exam not found
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

  // Render completed state
  if (examCompleted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md text-center">
        <div className="rounded-full bg-green-100 p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Exam Submitted!</h1>
        <p className="text-muted-foreground mb-8">
          Your answers have been submitted successfully. You will be redirected to the results page shortly.
        </p>
        <Button 
          onClick={() => navigate("/results")}
          className="bg-exam-primary"
        >
          Go to Results
        </Button>
      </div>
    );
  }

  // Render exam intro if not started
  if (!attemptStarted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button 
          variant="outline" 
          className="mb-6" 
          onClick={() => navigate("/exams/upcoming")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Exams
        </Button>
        
        <Card className="shadow-md">
          <CardHeader className="border-b bg-exam-light">
            <CardTitle className="text-exam-primary">{exam.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Exam Instructions</h3>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>This exam contains {exam.questions.length} questions.</li>
                  <li>You have {exam.duration} minutes to complete this exam.</li>
                  <li>Once started, the timer cannot be paused.</li>
                  <li>You can mark questions for review and return to them later.</li>
                  <li>Your answers are automatically saved every 30 seconds.</li>
                  <li>Click "Submit" when you're finished or wait for the timer to end.</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium">{exam.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Points</p>
                  <p className="font-medium">{exam.totalPoints} points</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available Until</p>
                  <p className="font-medium">{format(new Date(exam.endDate), "MMM dd, yyyy 'at' h:mm a")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Questions</p>
                  <p className="font-medium">{exam.questions.length} questions</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 justify-end">
            <Button 
              onClick={startExam}
              className="bg-exam-primary"
            >
              Start Exam
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Current question being displayed
  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);
  
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Question Panel */}
      <div className="flex-1 flex flex-col h-full overflow-auto">
        <div className="p-4 bg-white border-b flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2"
              onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {exam.questions.length}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2"
              onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex === exam.questions.length - 1}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            {autoSaving && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
            {lastSaved && <span className="text-xs text-muted-foreground">Last saved: {format(lastSaved, "h:mm:ss a")}</span>}
            
            <div className={cn(
              "flex items-center px-3 py-1 rounded-full text-sm font-medium",
              timeRemaining <= 300 ? "bg-red-100 text-red-700" : "bg-exam-light text-exam-primary"
            )}>
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {/* Question points */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-exam-primary">
                  {currentQuestion.type === 'multiple-choice' 
                    ? 'Multiple Choice' 
                    : currentQuestion.type === 'short-answer'
                      ? 'Short Answer'
                      : 'Long Answer'
                  }
                </h2>
                <span className="text-sm font-medium bg-exam-light text-exam-primary px-2 py-1 rounded">
                  {currentQuestion.points} points
                </span>
              </div>
              
              {/* Question content */}
              <div className="bg-white p-4 rounded-md border">
                <p className="text-lg">{currentQuestion.content}</p>
                
                {currentQuestion.imageUrl && (
                  <div className="mt-4">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="Question image" 
                      className="max-w-full h-auto rounded-md"
                    />
                  </div>
                )}
              </div>
              
              {/* Answer section */}
              <div className="bg-white p-5 rounded-md border">
                {currentQuestion.type === 'multiple-choice' && (
                  <RadioGroup 
                    value={String(currentAnswer?.answer || "")}
                    onValueChange={value => handleAnswerChange(currentQuestion.id, Number(value))}
                    className="space-y-3"
                  >
                    {currentQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md">
                        <RadioGroupItem value={String(index)} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {currentQuestion.type === 'short-answer' && (
                  <Input
                    placeholder="Type your answer here..."
                    value={String(currentAnswer?.answer || "")}
                    onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="w-full"
                  />
                )}
                
                {currentQuestion.type === 'long-answer' && (
                  <Textarea
                    placeholder="Type your answer here..."
                    value={String(currentAnswer?.answer || "")}
                    onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="w-full min-h-[200px] resize-y"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t bg-white flex justify-between sticky bottom-0">
          <div>
            <Button
              variant="outline"
              onClick={() => toggleMarkForReview(currentQuestion.id)}
              className={cn(
                "mr-4",
                currentAnswer?.markedForReview && "bg-yellow-50 border-yellow-300 text-yellow-700"
              )}
            >
              <Flag className={cn(
                "h-4 w-4 mr-2",
                currentAnswer?.markedForReview ? "text-yellow-500" : "text-muted-foreground"
              )} />
              {currentAnswer?.markedForReview ? "Marked for Review" : "Mark for Review"}
            </Button>
          </div>
          
          <div className="flex space-x-3">
            {currentQuestionIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            
            {currentQuestionIndex < exam.questions.length - 1 ? (
              <Button
                onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                className="bg-exam-primary"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowConfirmSubmit(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Exam
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Question Navigation Panel */}
      <div className="w-80 border-l bg-white hidden md:flex md:flex-col h-full overflow-auto">
        <div className="p-4 border-b">
          <h3 className="font-medium mb-2">Progress</h3>
          <Progress value={getProgressPercentage()} className="h-2 mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{answers.filter(a => a.answer).length} of {exam.questions.length} answered</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
        </div>
        
        <div className="p-4 border-b">
          <h3 className="font-medium mb-2">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {exam.questions.map((_, index) => {
              const status = getQuestionStatus(index);
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    status === "answered" && "bg-green-100 border-green-300 text-green-700",
                    status === "review" && "bg-yellow-100 border-yellow-300 text-yellow-700",
                    currentQuestionIndex === index && "ring-2 ring-exam-primary ring-offset-1"
                  )}
                  onClick={() => navigateToQuestion(index)}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="h-3 w-3 rounded-full bg-gray-200 border border-gray-300 mr-2"></div>
              <span>Unanswered</span>
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-4 border-t">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => setShowConfirmSubmit(true)}
          >
            Submit Exam
          </Button>
        </div>
      </div>
      
      {/* Time Warning Modal */}
      <AlertDialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time Warning</AlertDialogTitle>
            <AlertDialogDescription>
              You have only 5 minutes remaining. Please finish your exam and submit your answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Confirm Submit Modal */}
      <AlertDialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your exam? You won't be able to make changes after submission.
              
              {answers.some(a => !a.answer) && (
                <div className="mt-3 bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm">
                  Warning: You have unanswered questions. Please check before submitting.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitExam} className="bg-green-600 hover:bg-green-700">
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamTake;
