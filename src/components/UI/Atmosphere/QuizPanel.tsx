import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { atmosphereQuestions } from '@/data/atmosphere';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

export function QuizPanel() {
  const {
    currentQuizIndex,
    quizAnswers,
    setCurrentQuizIndex,
    answerQuestion,
    resetQuiz,
  } = useStore();

  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = atmosphereQuestions[currentQuizIndex];
  const hasAnswered = quizAnswers[question.id] !== undefined;

  const handleAnswer = (option: string) => {
    if (hasAnswered) return;
    answerQuestion(question.id, option.charAt(0));
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuizIndex < atmosphereQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1);
      setShowExplanation(false);
    }
  };

  const handleReset = () => {
    resetQuiz();
    setShowResult(false);
    setShowExplanation(false);
  };

  const correctCount = atmosphereQuestions.filter(
    (q) => quizAnswers[q.id] === q.answer
  ).length;

  if (showResult) {
    return (
      <div className="p-4 space-y-4 text-white">
        <h2 className="text-lg font-bold">测验结果</h2>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{correctCount} / {atmosphereQuestions.length}</p>
          <p className="text-gray-400 text-sm mt-2">
            正确率: {Math.round((correctCount / atmosphereQuestions.length) * 100)}%
          </p>
        </div>
        <button
          onClick={handleReset}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重新测验
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">随堂测验</h2>
        <span className="text-sm text-gray-400">
          {currentQuizIndex + 1} / {atmosphereQuestions.length}
        </span>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        <p className="text-sm leading-relaxed">{question.question}</p>

        {question.options && (
          <div className="space-y-2">
            {question.options.map((option) => {
              const optionLetter = option.charAt(0);
              const isSelected = quizAnswers[question.id] === optionLetter;
              const isAnswer = optionLetter === question.answer;

              let bgClass = 'bg-gray-700 hover:bg-gray-600';
              if (hasAnswered) {
                if (isAnswer) bgClass = 'bg-green-900/50 border border-green-600';
                else if (isSelected) bgClass = 'bg-red-900/50 border border-red-600';
                else bgClass = 'bg-gray-700 opacity-50';
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={hasAnswered}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${bgClass}`}
                >
                  <div className="flex items-center gap-2">
                    {hasAnswered && isAnswer && <CheckCircle className="w-4 h-4 text-green-400" />}
                    {hasAnswered && isSelected && !isAnswer && <XCircle className="w-4 h-4 text-red-400" />}
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {showExplanation && (
          <div className="bg-blue-900/30 border border-blue-700/50 rounded p-3 text-xs text-gray-300">
            <p className="font-semibold text-blue-300 mb-1">解析：</p>
            <p>{question.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={handlePrev}
          disabled={currentQuizIndex === 0}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-30 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          上一题
        </button>

        {currentQuizIndex === atmosphereQuestions.length - 1 ? (
          <button
            onClick={() => setShowResult(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded"
          >
            查看结果
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-1"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        onClick={handleReset}
        className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        重新开始
      </button>
    </div>
  );
}
