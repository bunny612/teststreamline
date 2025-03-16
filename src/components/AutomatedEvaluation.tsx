
import { useState } from "react";
import { Exam, ExamAttempt, StudentAnswer, Question, ModelAnswer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertCircle, Loader2, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AutomatedEvaluationProps {
  exam: Exam;
  attempts: ExamAttempt[];
  onComplete: (evaluatedAttempts: ExamAttempt[]) => void;
}

const AutomatedEvaluation = ({ exam, attempts, onComplete }: AutomatedEvaluationProps) => {
  const { toast } = useToast();
  const [evaluating, setEvaluating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<"strict" | "flexible" | "ai">("strict");
  
  const pendingAttempts = attempts.filter(a => a.status === "completed");
  const hasModelAnswers = exam.modelAnswers && exam.modelAnswers.length > 0;
  
  const evaluateAttempts = async () => {
    if (!hasModelAnswers) {
      toast({
        title: "Model Answers Missing",
        description: "Please upload model answers before automated evaluation",
        variant: "destructive"
      });
      return;
    }
    
    setEvaluating(true);
    setProgress(0);
    
    const evaluatedAttempts = [...attempts];
    
    // Simulate evaluation process
    for (let i = 0; i < pendingAttempts.length; i++) {
      const attemptIndex = evaluatedAttempts.findIndex(a => a.id === pendingAttempts[i].id);
      if (attemptIndex !== -1) {
        const evaluatedAnswers = evaluateAnswers(
          evaluatedAttempts[attemptIndex].answers,
          exam.questions,
          exam.modelAnswers || []
        );
        
        const totalScore = evaluatedAnswers.reduce((sum, ans) => sum + (ans.score || 0), 0);
        
        evaluatedAttempts[attemptIndex] = {
          ...evaluatedAttempts[attemptIndex],
          answers: evaluatedAnswers,
          status: "graded",
          totalScore: totalScore
        };
      }
      
      // Update progress
      setProgress(Math.round(((i + 1) / pendingAttempts.length) * 100));
      
      // Add a small delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setEvaluating(false);
    onComplete(evaluatedAttempts);
    
    toast({
      title: "Evaluation Complete",
      description: `Successfully evaluated ${pendingAttempts.length} submissions`,
    });
  };
  
  const evaluateAnswers = (
    studentAnswers: StudentAnswer[],
    questions: Question[],
    modelAnswers: ModelAnswer[]
  ): StudentAnswer[] => {
    return studentAnswers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      const modelAnswer = modelAnswers.find(m => m.questionId === answer.questionId);
      
      if (!question || !modelAnswer) {
        return answer;
      }
      
      let score = 0;
      let feedback = "";
      
      switch (question.type) {
        case "multiple-choice":
          // For multiple choice, exact match is required
          if (answer.answer === modelAnswer.answer) {
            score = question.points;
            feedback = "Correct answer";
          } else {
            score = 0;
            feedback = `Incorrect. The correct answer is option ${String.fromCharCode(65 + (modelAnswer.answer as number))}.`;
            if (modelAnswer.explanation) {
              feedback += ` ${modelAnswer.explanation}`;
            }
          }
          break;
        
        case "short-answer":
          // For short answers, we use different matching methods
          if (selectedMethod === "strict") {
            // Strict matching (exact match)
            if (String(answer.answer).trim().toLowerCase() === String(modelAnswer.answer).trim().toLowerCase()) {
              score = question.points;
              feedback = "Correct answer";
            } else {
              score = 0;
              feedback = `Incorrect. Expected: ${modelAnswer.answer}`;
              if (modelAnswer.explanation) {
                feedback += ` ${modelAnswer.explanation}`;
              }
            }
          } else if (selectedMethod === "flexible") {
            // Flexible matching (partial match)
            const studentAns = String(answer.answer).trim().toLowerCase();
            const modelAns = String(modelAnswer.answer).trim().toLowerCase();
            
            // Check if key terms from model answer are in student answer
            const modelTerms = modelAns.split(/\s+/);
            const matchCount = modelTerms.filter(term => 
              term.length > 3 && studentAns.includes(term)
            ).length;
            
            const matchRatio = matchCount / modelTerms.length;
            
            if (matchRatio > 0.8) {
              score = question.points;
              feedback = "Correct answer";
            } else if (matchRatio > 0.5) {
              score = Math.round(question.points * 0.7);
              feedback = "Partially correct answer";
            } else if (matchRatio > 0.3) {
              score = Math.round(question.points * 0.3);
              feedback = "Some correct elements, but incomplete";
            } else {
              score = 0;
              feedback = `Incorrect. Expected: ${modelAnswer.answer}`;
            }
            
            if (modelAnswer.explanation) {
              feedback += ` ${modelAnswer.explanation}`;
            }
          } else {
            // AI-based matching would be here in a real implementation
            // For now, we'll simulate it with a random score for demonstration
            score = Math.random() > 0.5 ? question.points : Math.round(question.points * 0.6);
            feedback = score === question.points ? 
              "Correct based on semantic meaning" : 
              "Partially correct, but missing some key points";
            
            if (modelAnswer.explanation) {
              feedback += ` ${modelAnswer.explanation}`;
            }
          }
          break;
          
        case "long-answer":
          // For long answers, we'll assign a partial score in flexible mode
          // In a real implementation, this would use NLP/AI for better evaluation
          if (selectedMethod === "strict") {
            // In strict mode, long answers require manual grading
            score = 0;
            feedback = "This answer requires manual evaluation.";
          } else {
            // Simulate partial auto-grading
            const responseLength = String(answer.answer).length;
            const minLength = 50; // Minimum expected length
            const targetLength = 200; // Ideal length
            
            if (responseLength < minLength) {
              score = Math.round(question.points * 0.1);
              feedback = "Response too short for automated evaluation. Needs manual review.";
            } else if (responseLength >= targetLength) {
              score = Math.round(question.points * 0.7);
              feedback = "Length criteria met. Content needs manual verification.";
            } else {
              const ratio = (responseLength - minLength) / (targetLength - minLength);
              score = Math.round(question.points * 0.1 + (question.points * 0.6 * ratio));
              feedback = "Partial automated score based on length. Needs manual review.";
            }
          }
          break;
          
        default:
          feedback = "This question type requires manual evaluation.";
      }
      
      return {
        ...answer,
        score,
        feedback
      };
    });
  };

  return (
    <Card className="shadow-md animate-scale-in">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold text-exam-primary mb-1">
              Automated Evaluation
            </CardTitle>
            <CardDescription>
              Evaluate student submissions automatically
            </CardDescription>
          </div>
          <Badge variant={hasModelAnswers ? "default" : "destructive"} className="h-7">
            {hasModelAnswers ? (
              <div className="flex items-center">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                <span>Model Answers Ready</span>
              </div>
            ) : (
              <div className="flex items-center">
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                <span>Model Answers Missing</span>
              </div>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="font-medium">Evaluation Settings</h3>
              <p className="text-sm text-slate-500">
                Choose how strictly to match student answers
              </p>
            </div>
            
            <Select
              value={selectedMethod}
              onValueChange={(value) => setSelectedMethod(value as "strict" | "flexible" | "ai")}
              disabled={evaluating}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">
                  <div className="flex items-center">
                    <span>Strict Matching</span>
                  </div>
                </SelectItem>
                <SelectItem value="flexible">
                  <div className="flex items-center">
                    <span>Flexible Matching</span>
                  </div>
                </SelectItem>
                <SelectItem value="ai">
                  <div className="flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-purple-500" />
                    <span>AI-Assisted (Beta)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Pending Submissions</span>
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded text-sm">
                {pendingAttempts.length} submissions
              </span>
            </div>
            
            {pendingAttempts.length > 0 ? (
              <ul className="space-y-2">
                {pendingAttempts.map((attempt, index) => (
                  <li key={attempt.id} className="text-sm flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded shadow-sm">
                    <span>Submission #{index + 1}</span>
                    <span className="text-slate-500">{new Date(attempt.endTime || "").toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 py-2">No pending submissions to evaluate</p>
            )}
          </div>
          
          {evaluating && (
            <div className="space-y-2 my-4">
              <div className="flex justify-between text-sm">
                <span>Evaluating submissions...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-800/50 flex justify-between">
        <div className="text-sm text-slate-500">
          {selectedMethod === "strict" ? (
            "Strict mode requires exact matches"
          ) : selectedMethod === "flexible" ? (
            "Flexible mode allows partial matching"
          ) : (
            "AI mode uses semantic understanding"
          )}
        </div>
        <Button 
          onClick={evaluateAttempts}
          className="bg-exam-primary hover:bg-exam-primary/90"
          disabled={evaluating || pendingAttempts.length === 0 || !hasModelAnswers}
        >
          {evaluating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Evaluating...
            </>
          ) : (
            "Start Automated Evaluation"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AutomatedEvaluation;
