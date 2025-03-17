
import { Exam, ExamAttempt, Question, StudentAnswer } from "@/types";
import { toast } from "@/hooks/use-toast";

/**
 * Evaluates a student's exam attempt against the exam questions and model answers
 */
export const evaluateExamAttempt = (
  attempt: ExamAttempt,
  exam: Exam
): ExamAttempt => {
  if (!exam || !attempt) {
    console.error("Missing exam or attempt data for evaluation");
    return attempt;
  }

  // Create a copy of the attempt to avoid modifying the original
  const evaluatedAttempt: ExamAttempt = {
    ...attempt,
    status: "graded",
  };

  let totalScore = 0;

  // Evaluate each answer
  const evaluatedAnswers = attempt.answers.map((answer) => {
    const question = exam.questions.find((q) => q.id === answer.questionId);
    
    if (!question) {
      console.error(`Question ${answer.questionId} not found in exam`);
      return answer;
    }

    // Calculate score based on question type
    const score = calculateAnswerScore(answer, question);
    totalScore += score;

    // Return evaluated answer with score
    return {
      ...answer,
      score,
      feedback: generateFeedback(answer, question, score),
    };
  });

  return {
    ...evaluatedAttempt,
    answers: evaluatedAnswers,
    totalScore,
    status: "graded",
  };
};

/**
 * Calculate the score for a given answer based on question type
 */
const calculateAnswerScore = (answer: StudentAnswer, question: Question): number => {
  switch (question.type) {
    case "multiple-choice":
      // For multiple choice, exact match required
      return answer.answer === question.correctAnswer ? question.points : 0;
    
    case "short-answer":
      // For short answers, do a simple case-insensitive comparison
      if (typeof answer.answer === 'string' && typeof question.correctAnswer === 'string') {
        const studentAnswer = answer.answer.trim().toLowerCase();
        const correctAnswer = question.correctAnswer.trim().toLowerCase();
        
        if (studentAnswer === correctAnswer) {
          return question.points;
        } else if (studentAnswer.includes(correctAnswer) || correctAnswer.includes(studentAnswer)) {
          // Partial match
          return Math.floor(question.points * 0.5);
        }
      }
      return 0;
    
    case "long-answer":
      // Long answers typically need manual evaluation
      // Here we set a placeholder score based on length as a basic metric
      if (typeof answer.answer === 'string') {
        const length = answer.answer.length;
        if (length > 200) {
          return Math.floor(question.points * 0.7); // Auto-score based on length
        } else if (length > 50) {
          return Math.floor(question.points * 0.3);
        }
      }
      return 0;
    
    case "pdf-upload":
      // PDF uploads typically need manual review
      return 0;
    
    default:
      return 0;
  }
};

/**
 * Generate feedback based on the answer and score
 */
const generateFeedback = (answer: StudentAnswer, question: Question, score: number): string => {
  if (score === question.points) {
    return "Correct answer!";
  } else if (score > 0) {
    return "Partially correct.";
  } else {
    switch (question.type) {
      case "multiple-choice":
        return `Incorrect. The correct answer was option ${typeof question.correctAnswer === 'number' ? 
          String.fromCharCode(65 + question.correctAnswer) : question.correctAnswer}.`;
      case "short-answer":
        return `Incorrect. Expected: ${question.correctAnswer}`;
      case "long-answer":
        return "This answer requires manual review by your instructor.";
      default:
        return "Incorrect answer.";
    }
  }
};

/**
 * Submit an exam for evaluation and return the evaluated attempt
 */
export const submitExamForEvaluation = async (
  attempt: ExamAttempt, 
  exam: Exam
): Promise<ExamAttempt> => {
  try {
    // In a real app, this would make an API call to the backend
    // For now, we'll simulate a delay and do client-side evaluation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Evaluate the exam
    const evaluatedAttempt = evaluateExamAttempt(attempt, exam);
    
    // In a real app, save the evaluated attempt to the database
    console.log("Exam evaluated:", evaluatedAttempt);
    
    // Return the evaluated attempt
    return evaluatedAttempt;
  } catch (error) {
    console.error("Error evaluating exam:", error);
    toast({
      variant: "destructive",
      title: "Error evaluating exam",
      description: "There was a problem evaluating your exam submission."
    });
    return attempt;
  }
};
