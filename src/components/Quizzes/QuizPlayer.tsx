import React, { useEffect, useState } from 'react';
import { supabase, type QuizQuestion } from '../../lib/supabase';
import { ChevronLeft, CheckCircle, XCircle } from 'lucide-react';

interface QuizPlayerProps {
  quizId: string;
  userId: string;
  lessonId: string;
  onBack: () => void;
}

export function QuizPlayer({ quizId, userId, lessonId, onBack }: QuizPlayerProps) {
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);

      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      setQuiz(quizData);

      const { data: questionsData } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order', { ascending: true });

      setQuestions(questionsData || []);
      setLoading(false);
    };

    fetchQuiz();
  }, [quizId]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    let score = 0;
    let totalMarks = 0;

    questions.forEach((question) => {
      totalMarks += question.marks;
      if (answers[question.id] === question.correct_answer) {
        score += question.marks;
      }
    });

    const percentage = (score / totalMarks) * 100;

    const { data: assessment } = await supabase
      .from('student_assessments')
      .insert({
        student_id: userId,
        quiz_id: quizId,
        lesson_id: lessonId,
        score,
        total_marks: totalMarks,
        percentage,
        completed_at: new Date().toISOString(),
        answers,
      })
      .select()
      .single();

    setResults({ score, totalMarks, percentage });
    setSubmitted(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading quiz...</div>;
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="text-green-600 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
          <p className="text-gray-700 mb-6">
            Your Score: <span className="text-3xl font-bold text-green-600">{results.percentage.toFixed(1)}%</span>
          </p>
          <p className="text-lg text-gray-600 mb-8">
            {results.score} out of {results.totalMarks} marks
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            Back to Lesson
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ChevronLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">{quiz?.title}</h2>
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {currentQuestion && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {currentQuestion.question_text}
            </h3>

            {currentQuestion.question_type === 'multiple_choice' ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option: string) => (
                  <label
                    key={option}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion.id] === option
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        )}

        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
