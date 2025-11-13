import React, { useEffect, useState } from 'react';
import { supabase, type User } from './lib/supabase';
import { AuthPage } from './components/Auth/AuthPage';
import { Navbar } from './components/Layout/Navbar';
import { StudentDashboard } from './components/Dashboard/StudentDashboard';
import { TeacherDashboard } from './components/Dashboard/TeacherDashboard';
import { LessonViewer } from './components/Lessons/LessonViewer';
import { QuizPlayer } from './components/Quizzes/QuizPlayer';

type Page = 'dashboard' | 'lesson' | 'quiz';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(userData);
      }

      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(userData);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={() => setUser(null)} />

      <main className="py-8 px-4 md:px-6">
        {currentPage === 'dashboard' && (
          <>
            {user.role === 'student' ? (
              <StudentDashboard
                user={user}
                onLessonSelect={(lessonId) => {
                  setSelectedLessonId(lessonId);
                  setCurrentPage('lesson');
                }}
              />
            ) : (
              <TeacherDashboard
                user={user}
                onCreateLesson={() => {
                  // TODO: Implement lesson creation
                }}
              />
            )}
          </>
        )}

        {currentPage === 'lesson' && selectedLessonId && (
          <div className="max-w-7xl mx-auto">
            <LessonViewer
              lessonId={selectedLessonId}
              userId={user.id}
              onBack={() => setCurrentPage('dashboard')}
              onQuizStart={(quizId) => {
                setSelectedQuizId(quizId);
                setCurrentPage('quiz');
              }}
            />
          </div>
        )}

        {currentPage === 'quiz' && selectedQuizId && (
          <div className="max-w-7xl mx-auto">
            <QuizPlayer
              quizId={selectedQuizId}
              userId={user.id}
              lessonId={selectedLessonId}
              onBack={() => setCurrentPage('lesson')}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
