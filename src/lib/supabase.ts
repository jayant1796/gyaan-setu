import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher';
  language_preference: string;
  school: string;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  content: string;
  subject: string;
  grade_level: number;
  language: string;
  created_by: string;
  created_at: string;
};

export type Quiz = {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'short_answer';
  options: string[];
  correct_answer: string;
  marks: number;
  order: number;
};

export type StudentAssessment = {
  id: string;
  student_id: string;
  quiz_id: string;
  lesson_id: string;
  score: number;
  total_marks: number;
  percentage: number;
  started_at: string;
  completed_at: string | null;
  answers: Record<string, string>;
};

export type StudentProgress = {
  id: string;
  student_id: string;
  lesson_id: string;
  completion_status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  last_accessed_at: string | null;
  completed_at: string | null;
};
