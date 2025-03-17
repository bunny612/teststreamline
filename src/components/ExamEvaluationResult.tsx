
import { useState } from "react";
import { Exam, ExamAttempt, StudentAnswer, Question } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertCircle, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ExamEvaluationResultProps {
  attempt: ExamAttempt;
  exam: Exam;
}

const ExamEvaluationResult = ({ attempt, exam }: ExamEvaluationResultProps) => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const totalPoints = exam.totalPoints || exam.questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = attempt.totalScore || 0;
  const percentage = Math.round((earnedPoints / totalPoints) * 100);
  
  // Get the grade letter based on percentage
  const getGradeFromPercentage = (percent: number): string => {
    if (percent >= 90) return 'A';
    if (percent >= 80) return 'B';
    if (percent >= 70) return 'C';
    if (percent >= 60) return 'D';
    return 'F';
  };
  
  const grade = getGradeFromPercentage(percentage);
  
  // Helper function to get question by ID
  const getQuestion = (questionId: string): Question | undefined => {
    return exam.questions.find(q => q.id === questionId);
  };
  
  // Status badge color based on grade
  const getStatusColor = (grade: string) => {
    switch(grade) {
      case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'C': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'D': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'F': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };
  
  const renderAnswer = (answer: StudentAnswer) => {
    const question = getQuestion(answer.questionId);
    
    if (!question) return null;
    
    const isCorrect = answer.score === question.points;
    const isPartiallyCorrect = answer.score && answer.score > 0 && answer.score < question.points;
    
    return (
      <Card key={answer.questionId} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base">{question.content}</CardTitle>
            <Badge className={`ml-2 ${
              isCorrect 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                : isPartiallyCorrect 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {isCorrect ? (
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
              ) : isPartiallyCorrect ? (
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
              ) : (
                <XCircle className="h-3.5 w-3.5 mr-1" />
              )}
              {answer.score !== undefined ? `${answer.score}/${question.points}` : 'Not evaluated'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">Your Answer:</p>
              <p className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                {question.type === 'multiple-choice' && question.options ? (
                  question.options[answer.answer as number]
                ) : (
                  String(answer.answer)
                )}
              </p>
            </div>
            
            {isTeacher || attempt.status === 'graded' ? (
              <div>
                <p className="text-sm font-medium">Correct Answer:</p>
                <p className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                  {question.type === 'multiple-choice' && question.options ? (
                    question.options[question.correctAnswer as number]
                  ) : (
                    String(question.correctAnswer)
                  )}
                </p>
              </div>
            ) : null}
            
            {answer.feedback && (
              <div>
                <p className="text-sm font-medium">Feedback:</p>
                <p className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md italic">{answer.feedback}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-exam-primary">{exam.title}</h2>
            <p className="text-muted-foreground">{exam.description}</p>
          </div>
          
          <Badge className={`px-3 py-1.5 text-sm font-medium ${getStatusColor(grade)}`}>
            Grade: {grade} ({percentage}%)
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-1">
            <span>Score: {earnedPoints}/{totalPoints}</span>
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Correct</span>
              </div>
              <p className="text-2xl font-bold">
                {attempt.answers.filter(a => a.score === getQuestion(a.questionId)?.points).length}
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-1">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Partially Correct</span>
              </div>
              <p className="text-2xl font-bold">
                {attempt.answers.filter(a => a.score !== undefined && a.score > 0 && a.score < getQuestion(a.questionId)?.points).length}
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-1">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium">Incorrect</span>
              </div>
              <p className="text-2xl font-bold">
                {attempt.answers.filter(a => a.score === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4">Question Details</h3>
        <div className="space-y-4">
          {attempt.answers.map(renderAnswer)}
        </div>
      </div>
    </div>
  );
};

export default ExamEvaluationResult;
