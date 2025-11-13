import React from 'react';
import { BookOpen, ChevronRight, Award } from 'lucide-react';
import type { Lesson, StudentProgress } from '../../lib/supabase';

interface LessonCardProps {
  lesson: Lesson;
  progress?: StudentProgress;
  onClick: () => void;
}

export function LessonCard({ lesson, progress, onClick }: LessonCardProps) {
  const progressPercentage = progress?.progress_percentage || 0;
  const isCompleted = progress?.completion_status === 'completed';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6 border border-gray-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {lesson.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Grade {lesson.grade_level} • {lesson.subject}
          </p>
        </div>
        {isCompleted && (
          <Award className="text-green-600 ml-2 flex-shrink-0" size={20} />
        )}
      </div>

      <p className="text-sm text-gray-700 line-clamp-2 mb-4">
        {lesson.description}
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Progress</span>
          <span className="text-xs font-semibold text-gray-900">
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors">
        {isCompleted ? 'Review' : 'Continue'}
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
