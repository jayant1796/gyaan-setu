import React, { useEffect, useState } from 'react';
import { supabase, type User } from '../../lib/supabase';
import { Users, BookOpen, Award, TrendingUp, Plus } from 'lucide-react';

interface TeacherDashboardProps {
  user: User;
  onCreateLesson: () => void;
}

export function TeacherDashboard({ user, onCreateLesson }: TeacherDashboardProps) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLessons: 0,
    averagePerformance: 0,
    activeStudents: 0,
  });
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: studentsData } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student');

      setStudents(studentsData || []);

      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('created_by', user.id);

      const { data: assessments } = await supabase
        .from('student_assessments')
        .select('percentage, student_id')
        .in(
          'lesson_id',
          lessonsData?.map((l) => l.id) || []
        );

      const avgPerformance = assessments && assessments.length > 0
        ? Math.round(assessments.reduce((sum, a) => sum + (a.percentage || 0), 0) / assessments.length)
        : 0;

      const activeStudentIds = new Set(assessments?.map((a) => a.student_id));

      setStats({
        totalStudents: studentsData?.length || 0,
        totalLessons: lessonsData?.length || 0,
        averagePerformance: avgPerformance,
        activeStudents: activeStudentIds.size,
      });

      setLoading(false);
    };

    fetchData();
  }, [user.id]);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.full_name}!
          </h1>
          <p className="text-gray-600">Monitor student progress and manage lessons</p>
        </div>
        <button
          onClick={onCreateLesson}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus size={20} />
          Create Lesson
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</p>
            </div>
            <Users className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeStudents}</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Lessons Created</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLessons}</p>
            </div>
            <BookOpen className="text-purple-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Performance</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.averagePerformance}%</p>
            </div>
            <Award className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Student Activity</h2>
          <div className="space-y-4">
            {students.slice(0, 5).map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div>
                  <p className="font-medium text-gray-900">{student.full_name}</p>
                  <p className="text-sm text-gray-600">{student.school}</p>
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={onCreateLesson}
              className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors text-left flex items-center gap-2"
            >
              <Plus size={18} />
              Create New Lesson
            </button>
            <button className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 text-green-600 font-medium rounded-lg transition-colors text-left flex items-center gap-2">
              <Award size={18} />
              View Assessments
            </button>
            <button className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-600 font-medium rounded-lg transition-colors text-left flex items-center gap-2">
              <TrendingUp size={18} />
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
