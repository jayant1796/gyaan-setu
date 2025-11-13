import React, { useEffect, useState } from 'react';
import { supabase, type Lesson, type StudentProgress } from '../../lib/supabase';
import { ChevronLeft, CheckCircle, Clock } from 'lucide-react';

interface LessonViewerProps {
  lessonId: string;
  userId: string;
  onBack: () => void;
  onQuizStart?: (quizId: string) => void;
}

export function LessonViewer({ lessonId, userId, onBack, onQuizStart }: LessonViewerProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedQuizzes, setRelatedQuizzes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      setLesson(lessonData);

      const { data: progressData } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (!progressData) {
        await supabase.from('student_progress').insert({
          student_id: userId,
          lesson_id: lessonId,
          completion_status: 'in_progress',
          progress_percentage: 0,
          last_accessed_at: new Date().toISOString(),
        });
      } else {
        setProgress(progressData);
      }

      const { data: quizzesData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId);

      setRelatedQuizzes(quizzesData || []);
      setLoading(false);
    };

    fetchData();
  }, [lessonId, userId]);

  const handleMarkComplete = async () => {
    await supabase
      .from('student_progress')
      .update({
        completion_status: 'completed',
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
      })
      .eq('student_id', userId)
      .eq('lesson_id', lessonId);

    setProgress((prev) =>
      prev
        ? { ...prev, completion_status: 'completed', progress_percentage: 100 }
        : null
    );
  };

  if (loading || !lesson) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const isCompleted = progress?.completion_status === 'completed';

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ChevronLeft size={20} />
        Back to Lessons
      </button>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {lesson?.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Grade {lesson?.grade_level}</span>
              <span>•</span>
              <span>{lesson?.subject}</span>
              <span>•</span>
              <span>{lesson?.language}</span>
            </div>
          </div>
          {isCompleted && (
            <CheckCircle className="text-green-600 flex-shrink-0" size={32} />
          )}
        </div>

        <p className="text-gray-700 mb-8">{lesson?.description}</p>

        <div className="prose prose-sm max-w-none mb-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 whitespace-pre-wrap text-gray-800">
            {lesson?.content}
          </div>
        </div>

        {!isCompleted && (
          <button
            onClick={handleMarkComplete}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Mark as Complete
          </button>
        )}
      </div>

      {relatedQuizzes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Assessment Quizzes
          </h2>

          <div className="grid gap-4">
            {relatedQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-between justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                  <p className="text-sm text-gray-600">{quiz.description}</p>
                </div>
                <button
                  onClick={() => onQuizStart?.(quiz.id)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ml-4 flex-shrink-0"
                >
                  Take Quiz
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
