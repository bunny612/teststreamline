
import { Exam, Question, ExamAttempt, ExamResult } from '../types';

// Mock exams
export const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    description: 'Basic concepts of computer science and programming',
    teacherId: '1',
    duration: 60, // 60 minutes
    startDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    endDate: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
    status: 'scheduled',
    totalPoints: 100,
    questions: [
      {
        id: '1-1',
        examId: '1',
        type: 'multiple-choice',
        content: 'What does CPU stand for?',
        options: [
          'Central Processing Unit',
          'Computer Personal Unit',
          'Central Process Utility',
          'Central Processor Unit'
        ],
        correctAnswer: 0,
        points: 10
      },
      {
        id: '1-2',
        examId: '1',
        type: 'multiple-choice',
        content: 'Which programming language is known for its use in web development?',
        options: [
          'C++',
          'Java',
          'JavaScript',
          'Swift'
        ],
        correctAnswer: 2,
        points: 10
      },
      {
        id: '1-3',
        examId: '1',
        type: 'short-answer',
        content: 'Define algorithm in your own words.',
        points: 20
      },
      {
        id: '1-4',
        examId: '1',
        type: 'long-answer',
        content: 'Explain the differences between procedural and object-oriented programming paradigms.',
        points: 30
      },
      {
        id: '1-5',
        examId: '1',
        type: 'multiple-choice',
        content: 'Which of the following is NOT a programming language?',
        options: [
          'Python',
          'Ruby',
          'HTML',
          'Jaguar'
        ],
        correctAnswer: 3,
        points: 10
      },
      {
        id: '1-6',
        examId: '1',
        type: 'short-answer',
        content: 'What is the purpose of a compiler?',
        points: 20
      }
    ]
  },
  {
    id: '2',
    title: 'Data Structures Fundamentals',
    description: 'Basic data structures and their implementations',
    teacherId: '1',
    duration: 90, // 90 minutes
    startDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    endDate: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
    status: 'scheduled',
    totalPoints: 100,
    questions: [
      {
        id: '2-1',
        examId: '2',
        type: 'multiple-choice',
        content: 'Which data structure operates on a LIFO principle?',
        options: [
          'Queue',
          'Stack',
          'Linked List',
          'Tree'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        id: '2-2',
        examId: '2',
        type: 'multiple-choice',
        content: 'What is the time complexity of binary search?',
        options: [
          'O(1)',
          'O(n)',
          'O(log n)',
          'O(n log n)'
        ],
        correctAnswer: 2,
        points: 10
      }
    ]
  },
  {
    id: '3',
    title: 'Mathematics 101',
    description: 'Introductory mathematics concepts',
    teacherId: '1',
    duration: 45,
    startDate: new Date(Date.now() - 86400000).toISOString(), // yesterday
    endDate: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    status: 'completed',
    totalPoints: 50,
    questions: [
      {
        id: '3-1',
        examId: '3',
        type: 'multiple-choice',
        content: 'What is 2 + 2?',
        options: [
          '3',
          '4',
          '5',
          '22'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        id: '3-2',
        examId: '3',
        type: 'short-answer',
        content: 'Solve for x: 2x + 3 = 7',
        points: 20
      }
    ]
  }
];

// Mock exam attempts
export const mockExamAttempts: ExamAttempt[] = [
  {
    id: '1',
    examId: '3',
    studentId: '2',
    startTime: new Date(Date.now() - 70000000).toISOString(),
    endTime: new Date(Date.now() - 68000000).toISOString(),
    status: 'graded',
    answers: [
      {
        questionId: '3-1',
        answer: 1,
        markedForReview: false
      },
      {
        questionId: '3-2',
        answer: 'x = 2',
        markedForReview: true
      }
    ],
    score: 30
  }
];

// Mock exam results
export const mockExamResults: ExamResult[] = [
  {
    examId: '3',
    studentId: '2',
    score: 30,
    totalPoints: 50,
    completedAt: new Date(Date.now() - 68000000).toISOString(),
    feedback: 'Good work! Keep studying.'
  }
];

// Get exams relevant for a student
export const getStudentExams = (studentId: string) => {
  return {
    upcoming: mockExams.filter(exam => 
      exam.status === 'scheduled' && new Date(exam.startDate) > new Date()
    ),
    available: mockExams.filter(exam => 
      exam.status === 'scheduled' && 
      new Date(exam.startDate) <= new Date() && 
      new Date(exam.endDate) >= new Date() &&
      !mockExamAttempts.some(attempt => 
        attempt.examId === exam.id && 
        attempt.studentId === studentId
      )
    ),
    completed: mockExams.filter(exam => 
      mockExamAttempts.some(attempt => 
        attempt.examId === exam.id && 
        attempt.studentId === studentId
      )
    )
  };
};

// Get exams created by a teacher
export const getTeacherExams = (teacherId: string) => {
  return {
    draft: mockExams.filter(exam => 
      exam.teacherId === teacherId && exam.status === 'draft'
    ),
    scheduled: mockExams.filter(exam => 
      exam.teacherId === teacherId && exam.status === 'scheduled'
    ),
    completed: mockExams.filter(exam => 
      exam.teacherId === teacherId && exam.status === 'completed'
    )
  };
};

// Get the result for a specific exam attempt
export const getExamResult = (examId: string, studentId: string) => {
  return mockExamResults.find(result => 
    result.examId === examId && result.studentId === studentId
  );
};
