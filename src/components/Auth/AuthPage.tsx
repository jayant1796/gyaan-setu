import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { BookOpen } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-600 p-3 rounded-lg">
              <BookOpen className="text-white" size={32} />
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-gray-900">Gyan Setu</h1>
              <p className="text-sm text-gray-600">Bridge of Knowledge</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-md transition-colors font-medium ${
                  isLogin
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-md transition-colors font-medium ${
                  !isLogin
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {isLogin ? (
            <LoginForm onSuccess={onAuthSuccess} />
          ) : (
            <RegisterForm onSuccess={onAuthSuccess} />
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Demo Credentials:</strong><br />
              Student: student@example.com / password123<br />
              Teacher: teacher@example.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
