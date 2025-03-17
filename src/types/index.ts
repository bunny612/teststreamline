
export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type QuestionType = 'multiple-choice' | 'short-answer' | 'long-answer' | 'pdf-upload';

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
  duration: number; // in minutes
  startDate: string; // ISO format with both date and time
  endDate: string; // ISO format with both date and time
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'graded';
  totalPoints: number;
  questions: Question[];
  pdfQuestionPaper?: string; // URL to the uploaded PDF
  modelAnswers?: ModelAnswer[]; // Added model answers
  timeRestriction?: {
    allowLateSubmission: boolean;
    gracePeriod?: number; // in minutes
  };
}

export interface ModelAnswer {
  questionId: string;
  answer: string | number;
  explanation?: string;
  answerPdfUrl?: string; // Added support for PDF answers
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
  endTime?: string;
  status: 'in-progress' | 'completed' | 'graded';
  answers: StudentAnswer[];
  score?: number;
  totalScore?: number;
}

export interface ExamResult {
  examId: string;
  studentId: string;
  score: number;
  totalPoints: number;
  completedAt: string;
  feedback?: string;
}
