import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Exam, Question, StudentAnswer, ExamAttempt } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { format } from 'date-fns';
import { Timer } from 'lucide-react';

import { submitExamForEvaluation } from "@/services/evaluationService";

interface Answer {
  questionId: string;
  answer: string | number;
}

const ExamTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: Answer }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // Mock data fetching
    const mockExam: Exam = {
      id: "1",
      title: "Sample Exam",
      description: "This is a sample exam for demonstration purposes.",
      teacherId: "teacher1",
      duration: 60,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      status: "active",
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          examId: "1",
          type: "multiple-choice",
          content: "What is the capital of France?",
          options: ["Berlin", "Paris", "Madrid", "Rome"],
          correctAnswer: 1,
          points: 25,
        },
        {
          id: "q2",
          examId: "1",
          type: "short-answer",
          content: "Explain the concept of recursion in programming.",
          correctAnswer: "Recursion is when a function calls itself.",
          points: 35,
        },
        {
          id: "q3",
          examId: "1",
          type: "long-answer",
          content: "Describe the advantages and disadvantages of using a relational database.",
          points: 40,
        },
      ],
    };

    setTimeout(() => {
      setExam(mockExam);
      setQuestions(mockExam.questions);
      setLoading(false);
      setStartTime(new Date().toISOString());

      // Calculate time remaining
      const endTime = new Date(mockExam.endDate).getTime();
      const now = new Date().getTime();
      setTimeRemaining(Math.max(0, endTime - now));
    }, 500);
  }, [id]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => Math.max(0, prevTime - 1000));
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && exam) {
      // Auto-submit the exam when time runs out
      handleSubmitExam();
    }
  }, [timeRemaining, exam]);

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: { questionId, answer },
    }));
  };

  const handleSubmitExam = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    setConfirmModalOpen(false);
    
    try {
      // Create the exam attempt submission
      const submission: ExamAttempt = {
        id: `attempt-${Date.now()}`,
        examId: exam.id,
        studentId: user?.id || '',
        startTime: startTime,
        endTime: new Date().toISOString(),
        status: 'completed',
        answers: Object.values(answers).map(a => ({
          questionId: a.questionId,
          answer: a.answer
        }))
      };
      
      // Submit for evaluation and get results
      const evaluatedAttempt = await submitExamForEvaluation(submission, exam);
      
      // In a real app, save the attempt to the backend
      console.log("Exam submitted and evaluated:", evaluatedAttempt);
      
      // Show success message
      toast({
        title: "Exam Submitted",
        description: "Your exam has been submitted successfully and evaluated.",
      });
      
      // Navigate to the results page
      navigate(`/results/${exam.id}`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem submitting your exam.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Exam Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The exam you're looking for doesn't exist or is not available.
        </p>
        <Button onClick={() => navigate("/exams/upcoming")} className="bg-exam-primary">
          Back to Exams
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{exam.title}</CardTitle>
          <CardDescription>{exam.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Timer className="mr-2 h-4 w-4" />
              Time Remaining: {formatTime(timeRemaining)}
            </div>
            <div>
              Start Time: {format(new Date(startTime), 'PPP p')}
            </div>
          </div>
        </CardContent>
      </Card>

      {questions.map((question) => (
        <Card key={question.id} className="mb-4">
          <CardHeader>
            <CardTitle>{question.content}</CardTitle>
            <CardDescription>Points: {question.points}</CardDescription>
          </CardHeader>
          <CardContent>
            {question.type === "multiple-choice" && question.options ? (
              <RadioGroup
                defaultValue={answers[question.id]?.answer?.toString() || ""}
                onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
              >
                <div className="grid gap-2">
                  {question.options.map((option, index) => (
                    <div className="flex items-center space-x-2" key={index}>
                      <RadioGroupItem value={index.toString()} id={`r${question.id}-${index}`} />
                      <Label htmlFor={`r${question.id}-${index}`}>{option}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : question.type === "short-answer" ? (
              <Input
                type="text"
                placeholder="Your answer"
                value={answers[question.id]?.answer?.toString() || ""}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
            ) : question.type === "long-answer" ? (
              <Textarea
                placeholder="Your answer"
                value={answers[question.id]?.answer?.toString() || ""}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
            ) : question.type === "pdf-upload" ? (
              <div>
                <Label htmlFor={`pdf-upload-${question.id}`}>Upload PDF:</Label>
                <Input type="file" id={`pdf-upload-${question.id}`} disabled />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <AlertDialogTrigger asChild>
          <Button disabled={submitting} className="bg-exam-primary">Submit Exam</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Please ensure all questions are answered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={submitting} onClick={handleSubmitExam}>
              {submitting ? "Submitting..." : "Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamTake;
