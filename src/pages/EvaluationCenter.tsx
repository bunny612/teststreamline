
import { useState, useEffect } from "react";
import { Exam, ExamAttempt, ModelAnswer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, FileText, Users, Brain, History } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ModelAnswerUpload from "@/components/ModelAnswerUpload";
import AutomatedEvaluation from "@/components/AutomatedEvaluation";

// Mock data - in a real app, this would come from an API
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
  ],
  modelAnswers: []
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
      },
      {
        questionId: "q2",
        answer: 3,
      },
      {
        questionId: "q3",
        answer: "A step-by-step process to solve a problem or task",
      },
      {
        questionId: "q4",
        answer: "A compiler translates the entire program at once while an interpreter executes the program line-by-line.",
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
      },
      {
        questionId: "q2",
        answer: 2,
      },
      {
        questionId: "q3",
        answer: "A set of instructions to complete a task",
      },
      {
        questionId: "q4",
        answer: "Compiler converts code to machine code all at once. Interpreter goes through the code line by line.",
      }
    ]
  }
];

// Mock student data
const mockStudents = {
  "student1": { name: "Alex Johnson", email: "alex@example.com" },
  "student2": { name: "Jamie Smith", email: "jamie@example.com" }
};

const EvaluationCenter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [activeTab, setActiveTab] = useState("model-answers");
  
  useEffect(() => {
    // In a real app, fetch from API
    setTimeout(() => {
      setExam(mockExam);
      setAttempts(mockAttempts);
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleSaveModelAnswers = (answers: ModelAnswer[]) => {
    if (!exam) return;
    
    setExam({
      ...exam,
      modelAnswers: answers
    });
    
    // In a real app, you would save this to your backend
    toast({
      title: "Model Answers Saved",
      description: "The model answers have been saved successfully",
    });
  };
  
  const handleEvaluationComplete = (evaluatedAttempts: ExamAttempt[]) => {
    setAttempts(evaluatedAttempts);
    
    // In a real app, you would save the evaluated attempts to your backend
    toast({
      title: "Evaluation Complete",
      description: "All submissions have been evaluated automatically",
    });
  };
  
  const goToManualEvaluation = () => {
    navigate(`/exams/${exam?.id}/evaluate`);
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
  
  const completedAttempts = attempts.filter(a => a.status === "completed").length;
  const gradedAttempts = attempts.filter(a => a.status === "graded").length;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-exam-primary">{exam.title}</h1>
            <p className="text-muted-foreground">{exam.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <FileText className="h-3.5 w-3.5 mr-1" />
              {exam.questions.length} Questions
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              <Users className="h-3.5 w-3.5 mr-1" />
              {attempts.length} Submissions
            </Badge>
            <Badge variant="outline" className={completedAttempts > 0 ? 
              "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : 
              "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }>
              <History className="h-3.5 w-3.5 mr-1" />
              {completedAttempts} Pending Review
            </Badge>
            <Badge variant="outline" className={gradedAttempts > 0 ? 
              "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" : 
              "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }>
              <ChevronRight className="h-3.5 w-3.5 mr-1" />
              {gradedAttempts} Graded
            </Badge>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
            <TabsTrigger value="model-answers">Model Answers</TabsTrigger>
            <TabsTrigger value="auto-evaluate">Auto Evaluation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="model-answers" className="space-y-6">
            <ModelAnswerUpload 
              questions={exam.questions}
              existingAnswers={exam.modelAnswers}
              onSave={handleSaveModelAnswers}
            />
            
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
              <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Need more control?</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Use manual evaluation for detailed feedback and personalized grading
                  </p>
                </div>
                <Button 
                  onClick={goToManualEvaluation}
                  className="min-w-[180px] bg-exam-primary hover:bg-exam-primary/90"
                >
                  Manual Evaluation
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="auto-evaluate" className="space-y-6">
            <AutomatedEvaluation
              exam={exam}
              attempts={attempts}
              onComplete={handleEvaluationComplete}
            />
            
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">Evaluation Progress</CardTitle>
                    <CardDescription>
                      {attempts.length} total submissions, {gradedAttempts} graded, {completedAttempts} pending
                    </CardDescription>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                        <div className="text-4xl font-bold text-exam-primary mb-1">
                          {Math.round((gradedAttempts / Math.max(1, attempts.length)) * 100)}%
                        </div>
                        <div className="text-sm text-slate-500">Completion Rate</div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                        <div className="text-4xl font-bold text-amber-500 mb-1">
                          {completedAttempts}
                        </div>
                        <div className="text-sm text-slate-500">Pending Review</div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                        <div className="text-4xl font-bold text-green-500 mb-1">
                          {gradedAttempts}
                        </div>
                        <div className="text-sm text-slate-500">Fully Graded</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center lg:items-center lg:border-l lg:pl-6 pt-4 lg:pt-0">
                    <div className="flex flex-col gap-3">
                      <Button 
                        onClick={goToManualEvaluation}
                        className="bg-exam-primary hover:bg-exam-primary/90"
                      >
                        Manual Evaluation
                      </Button>
                      <Button variant="outline">
                        Export Results
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EvaluationCenter;
