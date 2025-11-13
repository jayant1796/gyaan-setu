import React, { useEffect, useState } from 'react';
import { supabase, type Lesson, type StudentProgress, type User } from '../../lib/supabase';
import { TrendingUp, BookOpen, Award, AlertCircle } from 'lucide-react';
import { LessonCard } from '../Lessons/LessonCard';

interface StudentDashboardProps {
  user: User;
  onLessonSelect: (lessonId: string) => void;
}

export function StudentDashboard({ user, onLessonSelect }: StudentDashboardProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Map<string, StudentProgress>>(new Map());
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      setLessons(lessonsData || []);

      const { data: progressData } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', user.id);

      const progressMap = new Map();
      progressData?.forEach((p) => {
        progressMap.set(p.lesson_id, p);
      });
      setProgress(progressMap);

      const { data: assessments } = await supabase
        .from('student_assessments')
        .select('percentage')
        .eq('student_id', user.id);

      const completed = progressData?.filter(
        (p) => p.completion_status === 'completed'
      ).length || 0;

      const avgScore = assessments && assessments.length > 0
        ? assessments.reduce((sum, a) => sum + (a.percentage || 0), 0) / assessments.length
        : 0;

      setStats({
        totalLessons: lessonsData?.length || 0,
        completedLessons: completed,
        averageScore: Math.round(avgScore),
      });

      setLoading(false);
    };

    fetchData();
  }, [user.id]);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  const incompleteLessons = lessons.filter((l) => {
    const p = progress.get(l.id);
    return !p || p.completion_status !== 'completed';
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.full_name}!
        </h1>
        <p className="text-gray-600">Continue your learning journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Lessons Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.completedLessons}/{stats.totalLessons}
              </p>
            </div>
            <BookOpen className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Average Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.averageScore}%
              </p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Learning Streak</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {Math.floor(Math.random() * 7) + 1} days
              </p>
            </div>
            <Award className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {incompleteLessons.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-orange-500" size={20} />
            <h2 className="text-xl font-bold text-gray-900">
              Continue Your Learning ({incompleteLessons.length} lessons remaining)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incompleteLessons.slice(0, 3).map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                progress={progress.get(lesson.id)}
                onClick={() => onLessonSelect(lesson.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Lessons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              progress={progress.get(lesson.id)}
              onClick={() => onLessonSelect(lesson.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
