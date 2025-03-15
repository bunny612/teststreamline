
export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type QuestionType = 'multiple-choice' | 'short-answer' | 'long-answer';

export interface Question {
  id: string;
  examId: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  imageUrl?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  duration: number; // in minutes
  startDate: string;
  endDate: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  totalPoints: number;
  questions: Question[];
}

export interface StudentAnswer {
  questionId: string;
  answer: string | number;
  markedForReview: boolean;
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
}

export interface ExamResult {
  examId: string;
  studentId: string;
  score: number;
  totalPoints: number;
  completedAt: string;
  feedback?: string;
}
