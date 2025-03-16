
export type QuestionType = "multiple-choice" | "short-answer" | "long-answer" | "pdf-upload";

export interface Question {
  id: string;
  examId: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  imageUrl?: string;
  pdfUrl?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  duration: number;
  startDate: string;
  endDate: string;
  status: "draft" | "scheduled" | "active" | "completed" | "graded";
  totalPoints: number;
  questions: Question[];
  pdfUrl?: string;
}

export interface StudentAnswer {
  questionId: string;
  answer: string | number;
  markedForReview?: boolean;
  score?: number;
  feedback?: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  startTime: string;
  endTime: string;
  status: "in-progress" | "completed" | "graded";
  answers: StudentAnswer[];
  totalScore?: number;
  feedback?: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  submittedAt: string;
  gradedAt?: string;
  feedback?: string;
  answers: StudentAnswer[];
}
